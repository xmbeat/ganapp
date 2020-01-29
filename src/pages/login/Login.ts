import { NotificationServiceProvider } from './../../providers/globals/NotificationServiceProvider';
import { Component } from '@angular/core';
import { IonicPage, NavController, MenuController, AlertController, LoadingController, NavParams } from 'ionic-angular';
import { Configurations } from '../../providers/globals/Configurations';
import { Language } from '../../providers/globals/Language';
import { ExternalDataProvider } from '../../providers/globals/ExternalDataProvider';
import { Md5 } from 'ts-md5/dist/md5';


@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'Login.html'
})
export class LoginPage {
	login:any = {user:"", password: ""};
	constructor(public navCtrl: NavController, public navParms: NavParams, public lang: Language, public menuController: MenuController, public conf: Configurations,
		public externalData: ExternalDataProvider, public alertCtrl: AlertController, public loading: LoadingController, public notificationServiceProvider: NotificationServiceProvider ) {
	}

	ionViewDidEnter(){
		this.menuController.swipeEnable(this.navParms.get('swipeEnable'), "mainMenu");
	}
	onlineLogin(){
		if (this.login.user != "" && this.login.password != ""){
			let loader = this.loading.create({content:this.lang.get('login-init')});
			loader.present().then(()=>{
				let hashedPass = Md5.hashStr(this.login.password);
				this.externalData.login(this.login.user, hashedPass)
				.then((user)=>{
					this.conf.configs['user'] = user;
					this.conf.configs['mode'] = 0;
					this.conf.save().catch((error)=>{
						console.error(error);
					});
					//ALEX
					this.notificationServiceProvider.start();
					this.menuController.swipeEnable(true, "mainMenu");
					if (this.navParms.get('canGoBack')){
						this.navCtrl.pop();
					}
					else{
						this.navCtrl.setRoot('HomePage', {}, {animate:true});
					}
				})
				.catch(error=>{
					let alert = this.alertCtrl.create({
						title: this.lang.get('login-error'),
						message: error.message,
						buttons: [this.lang.get('ok')]
					});
					alert.present();
				})
				.then(()=>{
					loader.dismiss();
				})
			});
		}
	}

	offlineLogin(){
		this.conf.configs['mode'] = 1;
		this.menuController.swipeEnable(true, "mainMenu");
		this.conf.save().catch((error)=>{
			console.error(error);
		});
		if (this.navParms.get('canGoBack')){
			this.navCtrl.pop();
		}
		else{
			this.navCtrl.setRoot('HomePage', {}, {animate:true});
		}
	}

}
