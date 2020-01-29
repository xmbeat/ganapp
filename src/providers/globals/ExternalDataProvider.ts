import { LocalDataProvider } from './LocalDataProvider';
import { Platform} from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http, RequestOptions,Headers } from '@angular/http';
import { HTTP } from '@ionic-native/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/timeout';
@Injectable()
export class ExternalDataProvider{
	timeout: number = 15000;
	session_id: string;""
	listener:any = null;
	host = "http://192.168.0.222/ganapp";//"http://caz.lee.mx";//"http://ganapp.lee.mx";//
	url_logout =  this.host + "/Ganado/index.php/api/ganadoapp/logout";
	url_login = this.host + "/Ganado/index.php/api/ganadoapp/login";
	url_ganado_get = this.host + "/Ganado/index.php/api/ganadoapp/ganado_obtener";
	url_ganado_save = this.host + "/Ganado/index.php/api/ganadoapp/ganado_guardar";
	url_historial_get = this.host + "/Ganado/index.php/api/ganadoapp/historial_obtener";
	url_historial_save = this.host + "/Ganado/index.php/api/ganadoapp/historial_guardar";
	url_usuario_get = this.host + "/Ganado/index.php/api/ganadoapp/usuario_obtener";
	url_usuario_save = this.host + "/Ganado/index.php/api/ganadoapp/usuario_guardar";
	url_usuario_delete = this.host + "/Ganado/index.php/api/ganadoapp/usuario_borrar";
	url_notificacion_get = this.host + "/Ganado/index.php/api/ganadoapp/notificacion_obtener";
	url_notificacion_save = this.host + "/Ganado/index.php/api/ganadoapp/notificacion_guardar";
	url_data_get = this.host + "/Ganado/index.php/api/ganadoapp/datos_obtener";
	url_data_save = this.host + "/Ganado/index.php/api/ganadoapp/datos_guardar";
	constructor(private http: Http, private localData:LocalDataProvider, private httpn: HTTP,  private platform: Platform, ){
	
	}

	setErrorListener(listener){
		this.listener = listener;
	}
	setSession(session:string){
		this.session_id = session;
	}

	private sendPOST(url, body): Promise<any>{
		if(this.platform.is('cordova')){
			this.httpn.clearCookies();
			this.httpn.setRequestTimeout(this.timeout);
			this.httpn.setDataSerializer('json');
			
			let headers = {};
			headers['content-type'] = "application/json";
			if(this.session_id){
				headers['session-id'] = this.session_id;
			}
			
			return this.httpn.post(url, body,  headers)
			.then((data: any) =>{
				let headers = data['headers'];
				let result = JSON.parse(data.data);

				if (headers['session-id']){
					this.session_id = headers['session-id'];
				}
				
				if (result['status'] == 'ok'){
					if (this.session_id && headers['session-id'] !== undefined){
						result['result']['session_id'] = this.session_id;
					}
					//let test = result;
					return result['result'];
				}
				else{
					return Promise.reject(result);
				}
			})
			.catch(error=>{
				if (error['status']){
					if (error['status'] == -1){
						throw {
							status:"error",
							code: "-1"
						};
					}
				}
				throw error;
			});
		}else{
			let options = new RequestOptions();
			let headers = new Headers();
	
			headers.append('session-id', this.session_id);
			headers.append('content-type', "application/json");
			options.headers = headers;
	
			body = JSON.stringify(body);
	
			return this.http.post(url, body, options)
			.timeout(this.timeout).toPromise()
			.then((data: any) =>{
				let result = "";
				try{
					result = JSON.parse(data._body);
				}
				catch(error){
					return Promise.reject({'code': -2, 'result':'El servidor no devolvió un objeto JSON válido'});
				}
				if (data.headers.get('session-id') ){
					this.session_id = data.headers.get('session-id');
				}
			
				if (result['status'] == 'ok'){
					if (this.session_id && data.headers.get('session-id') !== null){
						result['result']['session_id'] = this.session_id;
					}
					return result['result'];
				}
				else{
					return Promise.reject(result);
				}
			});
		}
	}



	login(user, password): Promise<any>{
		let body:any = {user: user, password: password};
		return this.sendPOST(this.url_login, body);
	}

	logout(): Promise<any> {
		let body:any = {};
		return this.sendPOST(this.url_logout, body);
	}
	
	getUsers(filter = {}, limit = -1, offset = 0){
		let body:any = {filter: filter, limit: limit, offset: offset};
		return this.sendPOST(this.url_usuario_get, body)
		.catch(reason=>{
			this.processError(reason, "getUsers");
		});
		
	}

	deleteUser(filter = {}){
		let body:any = filter;
		return this.sendPOST(this.url_usuario_delete, body);
	}

	private processError(reason, source){
		if (this.listener){
			let ret = this.listener.onError(reason, source);
			if (ret){
				return Promise.reject(ret);
			}
		}
		else{
			return Promise.reject(reason);
		}
		return null;
	}

	getGanado(filter = {}, limit = -1, offset = 0, order_by = null, sort = null, columns = null){
		let body:any = {filter: filter, limit: limit, offset: offset, order_by:order_by, sort:sort, columns:columns};
		return this.sendPOST(this.url_ganado_get, body)
		.catch(reason=>{
			this.processError(reason, "getGanado");
		});
	}

	updateGanado(values, conditions){
		values['id'] = conditions['id'];
		return this.saveGanado(values);
	}

	createGanado(ganado){
		return this.saveGanado(ganado);
	}

	saveGanado(ganado){
		return this.sendPOST(this.url_ganado_save, ganado)
		.catch(reason=>{
			this.processError(reason, "saveGanado");
		});
	
	}

	saveUser(user){
		return this.sendPOST(this.url_usuario_save, user)
		.catch(reason=>{
			this.processError(reason, "saveUser");
		});
	}

	saveHistorial(registro){
		return this.sendPOST(this.url_historial_save, registro)
		.catch(reason=>{
			this.processError(reason, "saveHistorial");
		});
	}

	getHistorial(filter = {}, limit = -1, offset = 0, order_by = null, sort = null, columns=null, deep_get = false){
		let body:any = {filter: filter, limit: limit, offset: offset, order_by: order_by, sort: sort, columns:columns, deep_get:deep_get};
		return this.sendPOST(this.url_historial_get, body)
		.catch(reason=>{
			this.processError(reason, "getHistorial");
		});
	}

	getAllData():Promise<any>{
		let body:any = {'full':true};
		return this.sendPOST(this.url_data_get, body)
		.catch(reason=>{
			this.processError(reason, "getAllData");
		});
	}

	saveAllData(){
		let offset = 0;
		//Dado que en la base de datos puede haber imagenes, en lugar de solicitar todo, vamos de un registro cada vez
		let fnSyncGanado = (index):Promise<any> =>{
			//Obtenemos los que aun no se sincronizan de la base de datos local
			return this.localData.getGanado({sincronizado:0},1, index).then((result)=>{
				if (result.length > 0){
					let ganado = result[0];
					let id = ganado.id;
					delete ganado.id;
					//Ahora lo guardamos en el servidor ignorando el id local.
					return this.saveGanado(ganado).then((external_id)=>{
						ganado.external_id = external_id;
						ganado.id = id;
						//ganado.sincronizado = 1;
						//Ahora lo guardamos localmente con el id devuelto por el servidor
						return this.localData.saveGanado(ganado);
					})
					.then(()=>{
						//Repetimos el proceso de sincronizacion con el siguiente elemento
						return fnSyncGanado(index + 1);
					});
				}
			});
		};


		return fnSyncGanado(0).then(()=>{
			//Recuperamos el ganado de la base de datos, pero ahora todos los registros con solo id y external_id
			//para obtener su historial no sincronizado y guardarlo
			//let fnSyncHistorial = this.localData.getGanado({external_id__not: 0}, null, null, null, null, ['id', 'external_id']);
			return this.localData.getGanado({external_id__not_eq:0}, -1, 0, null, null, ['external_id', 'id']).then((ganado)=>{
				let map = [];
				for (let vaca of ganado){
					map[vaca.id] = vaca.external_id;
				}
				let fnSynHistorial = (index):Promise<any> => {
					if (index < ganado.length){
						return this.localData.getHistorial({sincronizado:0, ganado_id: ganado[index].id}, -1, 0, null,null,null, true).then(historiales=>{
							for (let historial of historiales){
								//El historial lo modificamos para que el id del ganado apunte al identificador externo
								historial.ganado_id = map[ganado[index].id];
								delete historial.id;
								//Si es de tipo parto, modificamos los hijos para que apunten a los id externos.
								if (historial.tipo == 2){
									for (let hijo of historial.referencia.hijos){
										hijo.id = map[hijo.id];
									}
								}
							}
							return this.saveHistorial(historiales).then(results=>{
								//Guardar cada uno de los ids generados TODO,
								return fnSynHistorial(index+1);
							});
						});
					}
					else{
						return Promise.resolve();
					}
				}
				return fnSynHistorial(0);
			});
		});
		

	}

	saveNotificacion(notification){
		return this.sendPOST(this.url_notificacion_save, notification)
		.catch(reason=>{
			this.processError(reason, "saveNotifications");
		});
	}
	
	getNotifications(filter = {}, limit = 0, offset = 0, order_by = null, sort = null, columns=null, deep_get = false){
		let body:any = {filter: filter, limit: limit, offset: offset, order_by: order_by, sort: sort, columns:columns, deep_get:deep_get};
		return this.sendPOST(this.url_notificacion_get, body)
		.catch(reason=>{
			return this.processError(reason, "getNotifications");
		});

	}
}