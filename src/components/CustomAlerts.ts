import { LoadingController, AlertController, Alert, Loading} from 'ionic-angular';
import { Language } from '../providers/globals/Language';
export class CustomAlerts{
	constructor(
		private loadingController:LoadingController, 
		private alertController:AlertController,
		private lang: Language){

	}

	wrapPromise(promise: Promise<any>, message:string ="") : Promise<any>{
		let loader = this.loadingController.create({content:message});
		
		return loader.present().then(()=>{
			return promise.then((data)=>{
				return loader.dismiss().then(()=>{
					return data;
				});
			})
			.catch((data)=>{
				return loader.dismiss().then(()=>{
					throw data;
				});
			});
		});
	}
	
	alertMessage(title:string, message:string, okCallback = null):Alert{
		let alert = this.alertController.create({
			title:title, 
			message:message,
			buttons: [
				{ text: this.lang.get('ok'), handler: okCallback}
			]
		});
		return alert;
	}	

	alertYesNo(title:string, message:string, onYesCallback = null, onNoCallback = null):Alert{
		let alert = this.alertController.create({
			title:title, 
			message:message,
			buttons: [
				{ text: this.lang.get('yes'), handler: onYesCallback},
				{ text: this.lang.get('no'), handler: onNoCallback}
			],
			enableBackdropDismiss: false
		});
		return alert;
	}
}
