import { NotificationServiceProvider } from './../../providers/globals/NotificationServiceProvider';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Configurations } from '../../providers/globals/Configurations';
import { Language } from '../../providers/globals/Language';
import { LocalDataProvider, GanadoModel, HistorialModel } from '../../providers/globals/LocalDataProvider'
import { ExternalDataProvider } from '../../providers/globals/ExternalDataProvider';
import { CustomAlerts } from '../../components/CustomAlerts';

@IonicPage()
@Component({
  selector: 'page-settings',
  templateUrl: 'Settings.html'
})
export class Settings {
	alerts: CustomAlerts;
	languageIndex:any;
	mode:any;
	constructor(public navCtrl: NavController, public navParams: NavParams, 
		public alertCtrl:AlertController, public loading: LoadingController,
		public conf: Configurations, public lang: Language,
		public externalData: ExternalDataProvider, public localData: LocalDataProvider,
		public notificationServiceProvider : NotificationServiceProvider) {
		this.alerts = new CustomAlerts(this.loading, this.alertCtrl, this.lang);
	} 


	ionViewDidEnter(){
		let list = this.lang.get('language-list');
		let actualLang = this.lang.getLang();
		for (let i = 0; i < list.length; i++){
			if (list[i].name == actualLang){
				this.languageIndex = i;
				break;
			}	
		}
		this.mode = this.conf.configs['mode'];
	}
	ionViewDidLeave(){
		this.conf.save().catch((error)=>{
			console.error(error);
		});
	}

	login(){
		this.navCtrl.push('LoginPage', {
			'canGoBack': true,
			'swipeEnable': true
		});
	}

	logout(){
		this.alerts.wrapPromise(this.externalData.logout().then(()=>{
			//Anon user
			this.conf.configs['user'] = null;
			//Offline mode
			this.conf.configs['mode'] = 1;
			this.externalData.setSession( null);
			this.notificationServiceProvider.stop();
			this.conf.save().catch((error)=>{
				console.error(error);
			});
			this.login();
		}).catch((error)=>{
			console.error(error);
		}));
	}
	
	onChangeMode(event){
		//En el modo online se requiere usuario y contraseña
		if (this.mode == 0){
			if (!this.conf.configs['user']){
				this.login();
				return;
			}
		}
		this.conf.configs['mode'] = this.mode;
	}

	onChangeLanguage(event){
		let lang = this.lang.get('language-list')[this.languageIndex].name;
		this.lang.setLang(lang);
		this.conf.configs['lang'] = lang;
	}

	getCloudCopy(){
		let promise:Promise<any> = this.externalData.getAllData().then((cloudData:any)=>{
			let lookup = {};
			let saverGanado : Promise<any> = Promise.resolve();
			//Guardamos el ganado primero
			for (let ganado of cloudData.ganado){
				let sourceID = ganado.id;
				delete ganado.id;
				saverGanado = saverGanado.then(()=>{
					return this.localData.saveGanado(ganado).then((id)=>{
						lookup[sourceID.toString()] = id;
					});
				});
			}
			//Guardamos los historiales
			saverGanado.then(()=>{
				let saverHistorial: Promise<any> = Promise.resolve();
				for (let historial of cloudData.historiales){
					let ganadoID = lookup[historial.ganado_id.toString()];
					historial.ganado_id = ganadoID;
					delete historial.id;
					saverHistorial.then(()=>{
						return this.localData.saveHistorial(historial);
					});
				}
			});

		})
		.catch(error=>{
			console.error(error);
			this.alerts.alertMessage(this.lang.get('error'), this.lang.get('register-cloud-save-error')).present();
		});
		this.alerts.wrapPromise(promise, this.lang.get('register-saving'));
	}
	
	saveCloud(){
		let promise = this.externalData.saveAllData().catch(error=>{
			console.error(error);
			this.alerts.alertMessage(this.lang.get('error'), this.lang.get('register-cloud-save-error')).present();
		});
		this.alerts.wrapPromise(promise, this.lang.get('register-saving'));
	}

	emptyRecyclebin(){
		this.alerts.alertYesNo(this.lang.get('recycle'), this.lang.get('recycle-confirm-empty'),
		()=>{
			//Borramos el historial de las vacas borradas primero
			let promise = this.localData.getGanado({borrado:1}).then((ganado)=>{
				let deleter: Promise<any> = null;
				for (let vaca of ganado){
					if (deleter == null){
						deleter = this.localData.deleteHistorial({ganado_id:vaca['id']});
					}
					else{
						deleter = deleter.then(()=>{
							return this.localData.deleteHistorial({ganado_id:vaca['id']});
						})
					}
				}
			}) //Ahora borramos las vacas
			.then(()=>{
				return this.localData.deleteGanado({borrado:1});
			})
			.then(()=>{
				//Borramos los historiales marcados
				return this.localData.deleteHistorial({borrado:1});

			})
			.catch(error=>{
				console.error(error);
				this.alerts.alertMessage(this.lang.get('error'), this.lang.get('register-delete-error')).present();
			});
			this.alerts.wrapPromise(promise, this.lang.get('register-deleting'));
		}).present();
	}
	
	restoreRecyclebin(){
		let promise = this.localData.updateGanado({borrado:0}, {borrado:1}).then(()=>{
			return this.localData.updateHistorial({borrado:0}, {borrado:1});
		})
		.catch(error=>{
			console.error(error);
			this.alerts.alertMessage(this.lang.get('error'), this.lang.get('register-update-error')).present();
		});
		this.alerts.wrapPromise(promise);
	}

}