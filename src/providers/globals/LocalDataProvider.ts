import { Injectable } from '@angular/core';
import { DatabaseFacade } from '../../app/database';
import { SQLiteObject } from '@ionic-native/sqlite';


@Injectable()
export class LocalDataProvider{
	db: DatabaseFacade;
	constructor(){
		this.db = new DatabaseFacade();
	}

	setDatabase(db: SQLiteObject){
		this.db.setDatabase(db);
	}

	init(){
		let models = [GanadoModel, HistorialModel, CalorModel, MuerteModel, EnfermedadModel, ServicioModel, PartoModel, PartoHijosModel];
		let promise:Promise<any> = null;
		for(let model of models){
			if (promise == null){
				promise = this.db.createTable(model.table, model.fields);
			}
			else{
				promise = promise.then(()=>{
					return this.db.createTable(model.table, model.fields);
				});
			}
		}
		return promise;
	}

	getGanado(filter = {}, limit = -1, offset = 0, order_by = null, sort = 0, columns = null){
		return this.db.get(GanadoModel.table, filter, limit, offset, order_by, sort, columns);
	}

	saveGanado(ganado){
		let filter = {};
		let primaryKeys = [];
		if (ganado['tatuaje']){
			primaryKeys.push('tatuaje');
			filter['tatuaje'] = ganado['tatuaje'];
		}
		if (ganado['siniiga']){
			primaryKeys.push('siniiga');
			filter['siniiga'] = ganado['siniiga'];
		}
		if (ganado['id']){
			if (primaryKeys.length > 0){
				return this.getGanado({'__or':filter}).then((result:Array<any>)=>{
					if (result && result.length == 1){
						if (result[0]['id'] == ganado['id']){
							return this.db.save(GanadoModel, ganado, [primaryKeys[0]]);
						}
					}
					else if (result == null || result.length  == 0){
						return this.db.save(GanadoModel, ganado);
					}
					return Promise.reject({code:1});

				});
			}
			else{
				return this.db.save(GanadoModel, ganado);
			}
		}
		//Se ha especificado solo una llave primaria(siniiga o tatuaje)
		else if (primaryKeys.length == 1){
			return this.db.save(GanadoModel, ganado, primaryKeys);
		}
		//Las dos llaves se especificaron
		else if (primaryKeys.length == 2){
			//Tratamos de actualizar tomando en cuenta al tatuaje como llave primaria
			return this.getGanado({siniiga: ganado['siniiga']}).then((results:Array<any>)=>{
				
				//Hay un elemento registrado con ese siniiga
				if (results && results.length > 0){
					//solo se puede actualizar si tiene el mismo tatuaje
					if (results[0]['tatuaje'] == ganado['tatuaje']){
						return this.db.save(GanadoModel, ganado, ['tatuaje']);
					}
					//Tratamos de actualizar por el siniiga como primary key
					else{
						//Solo si no hay un ganado con el mismo tatuaje
						return this.getGanado({tatuaje:ganado['tatuaje']}).then((results:Array<any>)=>{
							if (results && results.length > 0){
								return Promise.reject({code:1});
							}
							else{
								return this.db.save(GanadoModel, ['siniiga']);
							}
						})
					}
				}
				//Si no hay un elemento registrado con ese siniiga, se puede actualizar/crear tomando el tatuaje como primary key
				return this.db.save(GanadoModel, ganado, ['tatuaje']);
				
			});
		}
		else{
			return Promise.reject("ID Inválido");
		}
		
	}

	deleteGanado(filter){
		return this.db.delete(GanadoModel.table, filter);
	}

	createGanado(ganado){
		let filter = {};
		if (ganado['tatuaje']){
			filter['tatuaje'] = ganado['tatuaje']
		}
		else if (ganado['siniiga']){
			filter['siniiga'] = ganado['siniiga'];
		}
		else{
			return Promise.reject({code: 5});
		}
		return this.getGanado(filter).then((results:any)=>{

			if (results && results.length > 0){
				throw {code:1};
			}
			else{
				return this.db.create(GanadoModel.table, ganado);
			}
		});
	}

	updateGanado(values, conditions){
		let filter = {};
		let checkForId = true;
		if (values['tatuaje']){
			filter['tatuaje'] = values['tatuaje'];
		}
		else if (values['siniiga']){
			filter['siniiga'] = values['siniiga'];
		}
		else{
			checkForId = false;
		}
		if (checkForId){
			return this.getGanado(filter).then((results:any)=>{
				if (results && results.length > 0){
					return Promise.reject({code:1});
				}
				else{
					this.db.update(GanadoModel.table, values, conditions);
				}
			});
		}
		else{
			return this.db.update(GanadoModel.table, values, conditions);
		}
		
	}

	deleteHistorial(filter:any){

		//Obtenemos los historiales
		return this.db.get(HistorialModel, filter).then((result:Array<any>)=>{
			let deleter:Promise<any> = null;
			let models = [CalorModel, ServicioModel, PartoModel, EnfermedadModel];
			//Borramos los historiales
			return this.db.delete(HistorialModel, filter).then(()=>{
				let deleteFunction = (registro)=>{
					//Borramos la informacion extra de esos historiales
					return this.db.delete(models[registro.tipo], {id:registro.referencia}).then(()=>{
						//Borramos la relacion parto hijos
						if (registro.tipo == 2){
							return this.db.delete(PartoHijosModel, {parto_id:registro.referencia});
						}
						return null;
					});
				}
				for(let registro of result){
					if (deleter){
						deleter = deleter.then(()=>deleteFunction(registro));
					}
					else{
						deleter = deleteFunction(registro);
					}
				}
				return deleter;
			});
		})
		
	}


	getHistorial(filter = {}, limit = -1, offset = 0, order_by = null, sort = 0, columns = null, deep_get = true){
		//Obtenemos el registro historial
		return this.db.get(HistorialModel, filter, limit, offset, order_by, sort, columns)
		.then((results:Array<any>)=>{
			let models = [CalorModel, ServicioModel, PartoModel, EnfermedadModel];
			let promise: Promise<any> = null;
			if (results && deep_get){
				//Recorremos los registros del historial
				for (let i = 0; i < results.length; i++){
					let registro = results[i];
					registro['tipo'] = Number.parseInt(registro['tipo']);
					let table = models[registro['tipo']].table;
					let idRef = registro['referencia'];
					//obtenemos el historial detallado de cada registro
					let dbPromise = this.db.get(table, {id: idRef})
					.then((referencia:any)=>{
						if (referencia && referencia.length > 0){
							referencia = referencia[0];
						}
						
						registro['referencia'] = referencia;
						//Si es de tipo parto
						if (registro['tipo'] == 2){
							//se debe recuperar los hijos de dicho parto 
							//TODO mejorar el ORM permitiendo joins
							return this.db.get(PartoHijosModel,{parto_id:referencia['id']}).then((results:any)=>{
								referencia['hijos'] = [];
								//Recuperamos la informacion de cada hijo completa
								let ganadoPromise = null;
								for (let i = 0; i < results.length; i++){
									let ganado_id = results[i]['ganado_id'];
									let promise = this.db.get(GanadoModel, {id: ganado_id}).then((bovino:any)=>{
										if (bovino && bovino.length > 0){
											referencia['hijos'].push(bovino[0]);
										}
									});
									if (ganadoPromise){
										ganadoPromise = ganadoPromise.then(()=>{
											return promise;
										});
									}
									else{
										ganadoPromise = promise;
									}
								}
								return ganadoPromise;
							});
						}
					});
					if (promise){
						promise = promise.then(()=>{
							return dbPromise;
						});
					}
					else{
						promise = dbPromise;
					}
				} //End for
			}
			if (promise){
				return promise.then(()=>{
					return results;
				});
			}
			return results;
		});
	}

	updateHistorial(values, filter){
		this.db.update(HistorialModel, values, filter)
	}

	saveHistorial(registro:any){

		if (registro.referencia){
			let deleter: Promise<any>;
			if (registro.id){
				deleter = this.deleteHistorial({id:registro.id});
			}
			else{
				deleter = Promise.resolve();
			}
			let models = [CalorModel, ServicioModel, PartoModel, EnfermedadModel, MuerteModel];
			return deleter.then(()=>{
				//Guardamos el campo referencia en la tabla que corresponde
				registro['tipo'] = Number.parseInt(registro['tipo']);

				return this.db.save(models[registro['tipo']], registro['referencia'])
				.then((id)=>{
					//Cuando es de tipo parto guardamos los hijos paridos
					if (registro['tipo'] == 2){
						let ganadoSaver = (ganado)=>{
							return this.saveGanado(ganado).then(ganado_id=>{
								return this.db.save(PartoHijosModel, {parto_id:id, ganado_id:ganado_id});
							});
						};
						let promise:Promise<any> = null;
						//Guardamos los hijos
						if (registro.referencia && registro.referencia.hijos){
							for (let hijo of registro.referencia.hijos){
								if (promise){
									promise = promise.then(()=>{
										return ganadoSaver(hijo);
									});
								}
								else{
									promise = ganadoSaver(hijo);
								}
							}
						}
						if (promise){
							return promise.then(()=>{
								return id;
							});
						}
					}
					return id;
				})
				.then((id)=> {
					let temp:any = {};
					Object.assign(temp, registro);
					temp.referencia = id;
					console.log(temp);
					return this.db.save(HistorialModel, temp);
				});
			});
		}
		else{
			return this.db.save(HistorialModel, registro);
		}
	}
}


export class CalorModel{
	static table = "Calor";
	static primaryKeys = ["id"];
	static fields = {
		id: ["INTEGER", "PRIMARY KEY"]
	}
}


export class EnfermedadModel{
	static table = "Enfermedad";
	static primaryKeys = ["id"];
	static fields = {
		id: ["INTEGER", "PRIMARY KEY"],
		diagnostico: ["TEXT"],
		tratamiento: ["TEXT"]
	}
}

export class MuerteModel{
	static table = "Muerte";
	static primaryKeys = ['id'];
	static fields = {
		id: ['INTEGER', 'PRIMARY KEY'],
		tipo : ['INTEGER']
	}
}
export class ServicioModel{
	static table = "Servicio";
	static primaryKeys = ["id"];
	static fields = {
		id: ["INTEGER", "PRIMARY KEY"],
		tipo: ["INTEGER"],
		padre: ["INTEGER"],
		madre: ["INTEGER"],
		status: ["INTEGER"]
	}
}
export class PartoHijosModel{
	static table = "PartoHijos";
	static primaryKeys = ["id"];
	static fields = {
		id: ["INTEGER", "PRIMARY KEY"],
		parto_id: ["INTEGER"],
		ganado_id: ["INTEGER"]
	}
}

export class PartoModel{
	static table = "Parto";
	static primaryKeys = ["id"];
	static fields = {
		id: ["INTEGER", "PRIMARY KEY"],
		tipo: ["INTEGER"],
		servicio_id: ["INTEGER"]
	}
}

export class HistorialModel{
	static table = "Historial";
	static primaryKeys = ["id"];
	static fields = {
		id: ["INTEGER", "PRIMARY KEY"],
		ganado_id: ["INTEGER"],
		fecha: ["LONG"],
		tipo: ["INTEGER"],
		referencia: ["INTEGER"],
		anotaciones: ["TEXT"],
		borrado: ['INTEGER', "DEFAULT 0"],
		sincronizado: ['INTEGER', 'DEFAULT 0']
	}
}

export class GanadoModel{
	static table = "Ganado";
	static primaryKeys = ["id"];
	static fields = {
		id: ["INTEGER", "PRIMARY KEY"],
		external_id:['INTEGER', 'DEFAULT 0'],
		sincronizado: ['INTEGER', 'DEFAULT 0'],
		nombre: ["TEXT"],
		padre: ["TEXT"],
		madre: ["TEXT"],
		siniiga: ["TEXT"],
		tatuaje: ["TEXT"],
		tipo_servicio: ["INTEGER"],
		fecha_servicio: ["LONG"],
		fecha_nacimiento: ["LONG"],
		localizacion: ["INTEGER"],
		sexo: ["INTEGER"],
		peso_nacimiento: ["REAL"],
		tipo_parto: ["INTEGER"],
		tipo_nacimiento: ["INTEGER"],
		grado_genetico: ["INTEGER"],
		color_capa: ["INTEGER"],
		pigmentacion_ojo_derecho: ["INTEGER"],
		pigmentacion_ojo_izquierdo: ["INTEGER"],
		color_morro: ["INTEGER"],
		cuernos: ["INTEGER"],
		fecha_peso_destete: ["LONG"],
		peso_destete: ["REAL"],
		manejo_destete: ["INTEGER"],
		grupo_destete :["TEXT"],
		peso_anual: ["REAL"],
		fecha_peso_anual: ["LONG"],
		tipo_manejo_anual: ["INTEGER"],
		grupo_anual: ["TEXT"],
		circunferencia_escrotal: ["REAL"],
		fecha_circunferencia: ["LONG"],
		pelvimetria_vertical: ["REAL"],
		pelvimetria_horizontal: ["REAL"],
		fecha_pelvimetria: ["LONG"],
		fecha_talla_corporal: ["LONG"],
		talla_corporal: ["LONG"],
		imagen: ["TEXT"],
		inicio_comportamiento: ["INTEGER"],
		fin_comportamiento: ["INTEGER"],
		status_reproductivo: ["INTEGER", "DEFAULT 0"],
		status: ["INTEGER", "DEFAULT 0"],
		borrado: ["INTEGER", "DEFAULT 0"],
	}
}