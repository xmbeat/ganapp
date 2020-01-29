import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, NavParams, AlertController} from 'ionic-angular';
import { GanadoModel, LocalDataProvider } from '../../providers/globals/LocalDataProvider';
import { ExternalDataProvider } from '../../providers/globals/ExternalDataProvider';
import { Configurations } from '../../providers/globals/Configurations';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Language } from '../../providers/globals/Language';
import { CustomAlerts } from '../../components/CustomAlerts';
import { Md5 } from 'ts-md5/dist/md5';
@IonicPage()
@Component({
  selector: 'page-user-details',
  templateUrl: 'UserDetails.html'
})
export class UserDetails {
	alerts: CustomAlerts;
	user: any;
	source: any;
	canLeave: boolean;
	constructor(public navParams: NavParams, public navCtrl: NavController, public camera: Camera, public conf: Configurations, public lang: Language,
		public localData: LocalDataProvider, public externalData: ExternalDataProvider, public loading: LoadingController, public alertCtrl: AlertController) {
		this.alerts = new CustomAlerts(this.loading, this.alertCtrl, this.lang);

		//Bind Views-Data
		this.user = {};
		//La fuente de datos
		this.source = navParams.get("item");
		
	}


	ionViewDidLoad(){
		//Si se va actualizar un registro, pasamos los datos al bind
		if (this.source != null){
			Object.assign(this.user, this.source);
			this.convert(this.user, true);
		}
		else{
			this.source = {};
		}

		
	}

	convert(obj, rawToConverted = false){
		if (rawToConverted){
			if (obj['permisos']){
				let perm = parseInt(obj['permisos']);
				let result = [];
				for (let i = 0; i < 4; i++){
					if (perm & (1 << i)){
						result.push(i);
					}
				}
				obj['permisos'] = result;
			}
		}else{
			if (obj['permisos']){
				let perm = 0;
				for (let i = 0; i < obj['permisos'].length; i++){
					perm = perm | (1 << parseInt(obj['permisos'][i]));
				}
				obj['permisos'] = perm;
			}
			if (obj['temp_password']){
				obj['contrasena'] =  Md5.hashStr(obj['temp_password']);
			}
		}
		return obj;
	}

	getObjectDiff(base, modified, output = null){
		let size = 0;
		for (let attr in modified){
			if (!attr.startsWith('temp_') && modified[attr] != base[attr] ){
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
			let temp = this.convert(Object.assign({}, this.user), false)
			
			if (this.getObjectDiff(this.source, temp) == 0){
				resolve();
			}
			else{
				let alertPopup = this.alertCtrl.create({
		            title: this.lang.get('register'),
		            message: this.lang.get('register-not-saved-alert'),
		            buttons: [
		            	{
		                    text: this.lang.get('yes'),
		                    handler: () => {
		                        resolve();
		                    }
		                },
		                {
		                    text: this.lang.get('no'),
		                    handler: () => {
		                 		reject();
		                    }
		                }
		            ],
		            enableBackdropDismiss: false
		        });
		       	alertPopup.present();
			}
		});
		
	}

	guardar(){

		if (!this.user['usuario'] ||  (!this.user['contrasena'] && !this.user['temp_password']) ){
			this.alerts.alertMessage(this.lang.get('error'), this.lang.get('user-required-credentials')).present();
			return;
		}

		let temp = this.convert(Object.assign({}, this.user), false);
		let changes = {};
		let size = this.getObjectDiff(this.source, temp, changes);
		//Si hay diferencias entre el bind data y la fuente, lo guardamos
		if (size > 0){
			let loader = this.loading.create({content: this.lang.get('register-saving')});
			loader.present().then(()=>{
			let dataProvider:any;
			if (this.conf.configs['mode'] == 0){
				dataProvider = this.externalData;
			}
			else{
				dataProvider = this.localData;
			}
			
			//En caso de actualización, pasamos el campo id a los cambios para 
			//Que el data provider sepa cual actualizar
			if (this.source['id']){
				changes['id'] = this.source['id'];
			}
			console.log("Saving: ");
			console.log(changes);
			dataProvider.saveUser(changes)
			.then((result:any)=>{
				loader.dismiss();
					this.user.id = temp.id = result;

					Object.assign(this.source, temp);
				})
				.catch((error)=>{
					loader.dismiss().then(()=>{
						let alert = this.alertCtrl.create({
							title:this.lang.get('error'), 
							message:this.lang.get('register-save-error'), 
							buttons:[{
								text: this.lang.get('ok')
							}]
						});
						alert.present();
					});
				});
				
			})
		}
	}
	tomarFoto(){
		const options: CameraOptions = {
			quality: 50,//percent
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
			targetWidth : 720,
			targetHeight : 720,
			correctOrientation: true,
			destinationType: this.camera.DestinationType.DATA_URL,
			encodingType: this.camera.EncodingType.JPEG,
			mediaType: this.camera.MediaType.PICTURE,
			
		}

		this.camera.getPicture(options).then(ImageData=>{
			this.user.imagen = ImageData;
		})
		.catch(error=>{
		});
	}
}
