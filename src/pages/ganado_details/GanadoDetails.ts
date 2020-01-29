import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, NavParams, AlertController} from 'ionic-angular';
import { GanadoModel, LocalDataProvider } from '../../providers/globals/LocalDataProvider';
import { ExternalDataProvider } from '../../providers/globals/ExternalDataProvider';
import { Configurations } from '../../providers/globals/Configurations';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Language } from '../../providers/globals/Language';
import { CustomAlerts } from '../../components/CustomAlerts';
import { TimeoutError } from 'rxjs/util/TimeoutError';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { Platform } from 'ionic-angular'

@IonicPage()
@Component({
  selector: 'page-ganado-details',
  templateUrl: 'GanadoDetails.html'
})
export class GanadoDetails {
	alerts: CustomAlerts;
	activeSegment: string;
	model: GanadoModel;
	bovino: any;
	source: any;
	template: any;
	goBackOnSave:boolean;
	saveLocalOnError: boolean;
	onSaveListener: any;
	captureOnly: boolean;
	canLeave: boolean;
	returnTo: string;
	searching: boolean = false;
	
	constructor(public navParams: NavParams, public navCtrl: NavController, public camera: Camera, public conf: Configurations, public lang: Language, 
		public photoViewer: PhotoViewer, public platform: Platform,
		public localData: LocalDataProvider, public externalData: ExternalDataProvider, public loading: LoadingController, public alertCtrl: AlertController) {
		this.alerts = new CustomAlerts(this.loading, this.alertCtrl, this.lang);
		this.model = new GanadoModel();
		this.activeSegment = '0';
		//Bind Views-Data
		this.bovino = {};
		//La fuente de datos
		this.source = navParams.get("ganado");
		//Los datos que deben estar por defecto
		this.template = navParams.get("template");
		//Debo regresar de vista al guardarse
		this.goBackOnSave = navParams.get("goBackOnSave");
		this.onSaveListener = navParams.get('onSaveListener');
		//Debo guardar el registro locamente si el metodo remoto falla
		this.saveLocalOnError = navParams.get("saveLocalOnError");
		//Solo debo capturar los datos, sin guardar.
		this.captureOnly = navParams.get('captureOnly');

	}

	openHistory(){
		console.log("openHistory");
		console.log(this.source);
		if (this.source['id']){
			this.navCtrl.push('HistorialList', {
			  'ganado': this.source
			})
			.catch((error)=>{
				console.error(error);
			});
		}
	}

	ionViewDidLoad(){
		let promise: Promise<any>;
		//Si se está en modo online y se especficio una fuente de datos, recuperamos los datos completos
		if (this.source && this.source['id']){
			let loader = this.loading.create({content:this.lang.get('db-list')});
			let dataProvider = null;
			if (this.conf.configs['mode']){
				dataProvider = this.localData;
			}
			else{
				dataProvider = this.externalData;
			}
			promise = loader.present().then(()=>{
				return dataProvider.getGanado({id: this.source['id']}, 1);
			})
			.then( (results: Array<{}>) => {
				if (results.length > 0){
					Object.assign(this.source, results[0]);
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
				alert.present();
			})
			.then(()=>{
				return loader.dismiss();
			});
		}
		else{
			promise = Promise.resolve();
		}

		promise.then(()=>{
			//Si se va actualizar un registro, pasamos los datos al bind
			if (this.source != null){
				Object.assign(this.bovino, this.source);
			}
			else{
				this.source = {};
			}
			if (this.template != null){
				Object.assign(this.bovino, this.template);
			}
			this.convertDates(this.bovino, true);
		});
		
	}

	convertDates(obj, epochToString = false){
		for(let attr in obj){
			if (attr.startsWith('fecha') && obj[attr] != null){
				try{
					if (epochToString){
						obj[attr] = new Date(obj[attr] * 1000).toISOString();
					}
					else{
						obj[attr] = Math.ceil(new Date(obj[attr]).getTime() / 1000);
					}
				}
				catch(error){
				}
				
			}
		}
		return obj;
	}

	getObjectDiff(base, modified, output = null){
		let size = 0;
		for (let attr in modified){
			if (attr != 'id' && modified[attr] != base[attr]){
				if (output){
					output[attr] = modified[attr];	
				}
				size += 1;
			}
		}
		return size;
	}
	

	ionViewCanLeave():Promise<any>{
		return new Promise((resolve, reject) => {
			let temp = this.convertDates(Object.assign({}, this.bovino), false)
			
			if (this.getObjectDiff(this.source, temp) == 0 || this.searching){
				resolve();
			}
			else{
				this.alerts.alertYesNo(
					this.lang.get('register'), 
					this.lang.get('register-not-saved-alert'),
					()=>{
						resolve();
					},
					()=>{
						reject();
					}
				).present();
			}
		});
		
	}

	guardar(){
		if (!this.bovino['siniiga'] && !this.bovino['tatuaje']){
			this.alerts.alertMessage(this.lang.get('error'), this.lang.get('register-id-required')).present();
			return;
		}
		let modelConverted = this.convertDates(Object.assign({}, this.bovino), false);
		let changes = {};
		let size = this.getObjectDiff(this.source, modelConverted, changes);
		//Si hay diferencias entre el bind data y la fuente, lo guardamos
		if (size > 0){
			//Seleccionamos el provider dependiendo del modo
			let dataProvider:any = this.conf.configs['mode'] == 0 ? this.externalData:this.localData;
			
			let saver:Promise<any> = null;
			if (this.captureOnly == true){
				saver = Promise.resolve(null);
			}
			else{
				changes['sincronizado'] = 0;
				if (this.source['id']){
					saver = dataProvider.updateGanado(changes, {id: this.source['id']});
				}
				else{
					saver = dataProvider.createGanado(changes);	
				}
			}

			saver = saver.then((result)=>{
				if (result){
					this.bovino.id = modelConverted.id = result;
				}
				Object.assign(this.source, modelConverted);
				if (this.onSaveListener){
					this.onSaveListener.onSaveBovino(this.source);
				}
				if (this.goBackOnSave){
					this.navCtrl.pop();
				}
			})
			.catch((error)=>{
				let alertError = this.alerts.alertMessage(this.lang.get('error'), this.lang.get('register-save-error'));
				//El servidor no ha respondido a la peticion
				if (error instanceof TimeoutError && this.saveLocalOnError){
					//Si el usuario quiere crear una copia local en respuesta
					this.alerts.alertYesNo(
						this.lang.get('error'), 
						this.lang.get('register-save-error-confirm-local'),
						()=>{
							this.localData.saveGanado(modelConverted).then((result)=>{
								modelConverted['id'] = result;
								Object.assign(this.source, modelConverted);
								if (this.onSaveListener){
									this.onSaveListener.onSaveBovino(this.source);
								}
								if (this.goBackOnSave){
									this.navCtrl.pop();
								}
							}).catch(()=>{
								alertError.present();
							});
						}
					).present();
				}
				else {
					if (error['code']){
						alertError.setMessage(this.lang.get('message-errors')[error['code']]);
					}
					alertError.present();
				}
				
			});
			
			this.alerts.wrapPromise(saver, this.lang.get('register-saving'));
		} // end if
		
	}

	onBirthChange(event:any){
		if (this.bovino['fecha_nacimiento']){
			this.alerts.alertYesNo(
				this.lang.get('cattle-service-date'),
				this.lang.get('update-service-date'),
				()=>{
					let temp = new Date(this.bovino['fecha_nacimiento']);
					temp.setDate(temp.getDate() - 283);
					this.bovino['fecha_servicio'] = temp.toISOString();
				}
			).present();
		}
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
			this.bovino.madre = ganado.siniiga;
		}
		else{
			this.bovino.padre = ganado.siniiga;
		}
		this.searching = false;
	}

	verFoto(){
		if (this.bovino.imagen){
			if (this.platform.is('android') || this.platform.is('ios')){
				let title = this.bovino['nombre'];
				if (!title){
					title = this.bovino['siniiga'];
				}
				if (!title){
					title = this.bovino['tatuaje'];
				}
				let imagen = "data:image," + this.bovino.imagen;
				this.photoViewer.show(imagen, title);
			}
			else{

			}
		}
	}

	onPause(event:any){
		return {hello:'world!'};
	}

	tomarFoto(){
		const options: CameraOptions = {
			quality: 75,//percent
			//                 Width X Height		
			// 0.3 Megapixel 	 640 x 480
			// HD               1280 x 720 	
			// 1.3 Megapixel 	1392 x 1024
			// 2.0 Megapixel 	1600 x 1200
			// FullHD           1920 x 1080 
			// 3.3 Megapixel 	2080 x 1542
			// 5.0 Megapixel 	2580 x 1944 
			// 6.0 Megapixel 	2816 x 2112
			// 8.0 Megapixel 	3264 x 2448 
			// 12.5 Megapixel 	4080 x 3072
			targetWidth : 2580,
			targetHeight : 1944,
			correctOrientation: true,
			destinationType: this.camera.DestinationType.DATA_URL,
			encodingType: this.camera.EncodingType.JPEG,
			mediaType: this.camera.MediaType.PICTURE
		}

		this.conf.configs['GanadoDetails_bovino'] = this.bovino;
		this.conf.save().then(()=>{
			this.camera.getPicture(options).then(ImageData=>{
				this.bovino.imagen = ImageData;
			})
			.catch(error=>{
				console.log(error);
			});
		})
		
	}
}
