import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, NavParams, AlertController} from 'ionic-angular';
import { GanadoModel, LocalDataProvider } from '../../providers/globals/LocalDataProvider';
import { ExternalDataProvider } from '../../providers/globals/ExternalDataProvider';
import { Configurations } from '../../providers/globals/Configurations';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Language } from '../../providers/globals/Language';

@IonicPage()
@Component({
  selector: 'page-historial-details',
  templateUrl: 'HistorialDetails.html'
})
export class HistorialDetails {
	parto:any = {hijos:[], tipo:0};
	servicio:any = {tipo:0, madre:null, padre:null, status:0};
	calor:any = {};
	enfermedad:any = {tratamiento:null, enfermedad:null};
	muerte:any = {tipo:null};
	registro: any = {anotaciones:""};
	source: any;
	canLeave: boolean;
	ganado:any = {};
	searching:boolean = false;
	servicio_previo:any = null;

	constructor(public navParams: NavParams, public navCtrl: NavController, public camera: Camera, public conf: Configurations, public lang: Language,
		public localData: LocalDataProvider, public externalData: ExternalDataProvider, public loading: LoadingController, public alertCtrl: AlertController) {

		//La fuente de datos
		this.source = navParams.get("historial");
		//Obtenemos el ganado al que pertenece este historial
		this.ganado = navParams.get('ganado');
	}

	ionViewDidLoad(){
		let promise: Promise<any>;		
		if (this.source && this.source['id']){
			let provider = null;
			if (this.conf.configs['mode'] == 0){
				provider = this.externalData;
			}
			else{
				provider = this.localData;
			}
			let loader = this.loading.create({content:this.lang.get('db-list')});
			promise = loader.present().then(()=>{
				return provider.getHistorial({id:this.source['id']}, 1, 0, null, null, null, true);
			})
			.then((results:Array<any>)=>{
				if (results.length > 0){
					results[0]['tipo'] = parseInt(results[0]['tipo']);
					Object.assign(this.source, results[0]);
					Object.assign(this.registro, this.source);
					this.convertDates(this.registro, true);
					if (this.registro.referencia == null){
						this.registro.referencia = {};
					}
					if (this.registro.tipo == 0){
						this.calor = this.registro['referencia'] 
					}
					if (this.registro.tipo == 1){
						this.servicio = this.registro['referencia'];
						this.servicio.status = Number.parseInt(this.servicio.status);
						this.servicio.tipo = Number.parseInt(this.servicio.tipo);
					}//Si es parto
					if (this.registro.tipo == 2){
						this.parto = this.registro['referencia'];
						this.parto.tipo = Number.parseInt(this.parto.tipo);
						if (this.parto.hijos == null){
							this.parto.hijos = [];
						}
					}
					if (this.registro.tipo == 3){
						this.enfermedad = this.registro['referencia'];
					}
					if (this.registro.tipo == 4){
						this.muerte = this.registro['referencia'];
					}
					//Si no se especifico a que ganado pertenece, lo recuperamos
					if (this.ganado == null){
						//provider.getGanado({id: })
					}
				}
			})
			.catch(error=>{
				let alert = this.alertCtrl.create({
					title:"Error", 
					message:this.lang.get('db-error-list'), 
					buttons:[{
						text: this.lang.get('ok')
					}]
				});
				this.source = {};
				alert.present();
			})
			.then(()=>{
				return loader.dismiss();
			})
		}
		else{
			Object.assign(this.registro, this.source);
			this.registro['fecha'] = new Date().toISOString();
		}		
	}
	
	convertDates(obj, epochToString = false){
		for(let attr in obj){
			if (attr.startsWith('fecha') && obj[attr] != null){
				//Numero a ISO string
				if (epochToString){
					obj[attr] = new Date(obj[attr] * 1000).toISOString();
				}
				//ISO String a numero
				else if (isNaN(obj[attr])){
					obj[attr] = Math.ceil(new Date(obj[attr]).getTime() / 1000);
				}
			}
			else if (typeof(obj[attr]) == 'object'){
				this.convertDates(obj[attr], epochToString);
			}
		}
		return obj;
	}
	
	guardar(){
		if (this.registro.tipo == null){
			let alert = this.alertCtrl.create({
				title: this.lang.get('error'),
				message: this.lang.get('register-type-required'),
				buttons: [this.lang.get('ok')]
			});
          	alert.present();
			return;
		}
		let changes = this.convertDates(Object.assign({}, this.registro), false);
		if (this.registro.tipo == 0){
			changes['referencia'] = this.calor;
		}
		//Servicio
		if (this.registro.tipo == 1){
			changes['referencia'] = this.servicio;
			//Si no se ha establecido quien es la madre
			if (!this.servicio.madre || this.servicio.madre == "" ){
				this.servicio.madre = this.ganado.siniiga;
			}
		}
		//Si es parto
		if (this.registro.tipo == 2){
			changes['referencia'] = this.parto;
		}
		if (this.registro.tipo == 3){
			changes['referencia'] = this.enfermedad;
		}
		
		if (this.registro.tipo == 4){
			 changes['referencia'] = this.muerte;
		}
		let loader = this.loading.create({content: this.lang.get('register-saving')});
		loader.present().then(()=>{
			let dataProvider:any;
			if (this.conf.configs['mode'] == 0){
				dataProvider = this.externalData;
			}
			else{				
				dataProvider = this.localData;
			}
			dataProvider.saveHistorial(changes)
			.then((result:any)=>{
				loader.dismiss();
				this.registro.id = changes.id = result;
				Object.assign(this.source, changes);
			})
			.catch((error)=>{
				loader.dismiss().then(()=>{
					
					let alert = this.alertCtrl.create({
						title: this.lang.get('error'), 
						message: this.lang.get('register-save-error'), 
						buttons:[{
							text: this.lang.get('ok')
						}]
					});

					if (error['code'] && error['code'] < this.lang.get('message-errors').length){
						alert.setMessage(this.lang.get('message-errors')[error['code']]);
					}

					alert.present();
				});
			});
			
		})
		
	}
	


	removeChildren(index){
		this.parto.hijos.splice(index, 1);
	}

	onSaveBovino(child:any){
		this.parto.hijos.push(child);
	}

	childTapped(event, index){
		this.navCtrl.push('GanadoDetails', {
			goBackOnSave:true, 
			captureOnly: true,
			ganado: this.parto.hijos[index]
		});
	}
	//Regitro.tipo  debe ser parto (2)
	addChildren(){
		let promise: Promise<any> = null;
		if (!this.servicio_previo){
			let dataProvider = null;
			if (this.conf.configs['mode']){
				dataProvider = this.localData;
			}
			else{
				dataProvider = this.externalData;
			}
			let loader = this.loading.create({content:this.lang.get('getting-information')});

			promise = loader.present().then(()=>{
				let fecha = new Date(this.registro.fecha).getTime()/1000;
				let filter = {
					ganado_id:this.source.ganado_id, 
					tipo:1,
					fecha__lte: fecha
				};
				return dataProvider.getHistorial(filter, 1, 0, 'fecha', 1, null, true).then(result=>{
					loader.dismiss();
					if (result && result.length > 0){
						this.servicio_previo = result[0];
					} 
					return this.servicio_previo;;
				})
				.catch(()=>{
					loader.dismiss();
					return null;
				});
			})
		}
		else{
			promise = Promise.resolve(this.servicio_previo);
		}

		promise.then((servicio)=>{
			let template:any = {
				fecha_nacimiento: this.registro.fecha,
				tipo_parto: this.parto.tipo
			};
			if (servicio){
				template.madre = servicio.referencia.madre;
				template.padre = servicio.referencia.padre;
				template.tipo_servicio = servicio.referencia.tipo;
				template.fecha_servicio = servicio.fecha;

			}
			return template;
			
		})
		.catch(()=>{
			return {tipo_parto:this.parto.tipo};
		})
		.then(template=>{
			this.navCtrl.push('GanadoDetails', {
				goBackOnSave: true, 
				template: template, 
				onSaveListener: this,
				captureOnly: true,
			});
		});

		
	}

	buscar(event:any, source){
		this.searching = true;
		let filter = {
			sexo: source == 'madre'? 0: 1
		}
		this.navCtrl.push('GanadoList', {
			filter: filter,
			selectOnly: true,
			onSelectListener: this,
			extra: source
		})
	}
	//Llamado cuando seleccionan un padre o madre
	onSelect(ganado, source){
		if (source == 'madre'){
			this.servicio.madre = ganado.siniiga;
		}
		else{
			this.servicio.padre = ganado.siniiga;
		}
		this.searching = false;
	}
}
