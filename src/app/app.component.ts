import { BackgroundMode } from '@ionic-native/background-mode';
import { NotificationServiceProvider } from './../providers/globals/NotificationServiceProvider';
import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController, LoadingController, NavController, ViewController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Configurations } from '../providers/globals/Configurations';
import { LocalDataProvider } from '../providers/globals/LocalDataProvider';
import { ExternalDataProvider } from '../providers/globals/ExternalDataProvider';
import { Language } from '../providers/globals/Language';
import { LocalNotifications } from '@ionic-native/local-notifications';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = null;
  configs: any;
  pages: Array<{icon: string, title: string, component: any}>;

  constructor( public platform: Platform, public statusBar: StatusBar, public alertCtrl: AlertController, public loading: LoadingController,
    public splashScreen: SplashScreen, public configurations: Configurations, public dataProvider: LocalDataProvider, public externalData: ExternalDataProvider,
    public lang: Language, public notifications: LocalNotifications, public notificationServiceProvider: NotificationServiceProvider, public bg: BackgroundMode) {
    this.initializeApp();
    this.platform.resume.subscribe((event:any)=>{
      this.onResume(event);
    });
    this.platform.pause.subscribe((event:any)=>{
      this.onPause(event);
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      //this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString("#067040");
      let loader = this.loading.create({content: this.lang.get('db-init')});
      //Creamos la base de datos
      loader.present().then(()=>{
        return this.configurations.getDefaultDatabase();
      })
      .then(db=>{ 
         this.configurations.setDatabase(db);
         this.dataProvider.setDatabase(db);
      })
      .then(()=>{
         return this.configurations.init();
      })
      .then(()=>{
        return this.dataProvider.init();
      })
      .catch((error)=>{
          let alert = this.alertCtrl.create({
            title: this.lang.get('db-error'),
            message: JSON.stringify(error),
            buttons: [this.lang.get('ok')]
          });
          alert.present();
      })
      .then(()=>{
        this.splashScreen.hide();
        this.externalData.setErrorListener(this);
        this.lang.setLang(this.configurations.configs['lang']);        
        this.pages = [];
        this.pages.push({title: 'home', component: 'HomePage', icon: 'home'});  
        this.pages.push({title: 'cattle', component: 'GanadoList', icon: 'list-box'});
        this.pages.push({title: 'users', component:'UserList', icon:'people'});
        this.pages.push({title: 'stats', component: 'StatsListPage', icon:'stats'});
        this.pages.push({title: 'notifications', component:'NotificationListPage', icon:'alarm'});
        this.pages.push({title: 'settings', component: 'Settings', icon: 'settings'});
       
        let user = this.configurations.configs['user'];
        let mode = this.configurations.configs['mode'];
        
         //ALEX iniciar el servicio de notificaciones.
         this.notificationServiceProvider.run(this.nav);

          //Si hay una session iniciada
        if (user && user.session_id){
          loader.setContent(this.lang.get('login-init'));
          //Usamos ese ID de session para las operaciones
          this.externalData.setSession(user.session_id);
          loader.dismiss();
          this.rootPage = "GanadoList";
          //ALEX : empesar a recupera notificaciones.
          this.notificationServiceProvider.start();
        }
        //No hay session, pero es modo offline
        else if (mode == 1){
          loader.dismiss();
          this.rootPage = "GanadoList";
        }
        else{
          loader.dismiss();
          this.rootPage = "LoginPage";
        }
      });
    });
  }

  

  onResume(event:any) {
    console.log("On resume:");
    console.log(event);
    let stack = this.configurations.configs['stack_pages'];
    for (let recover in stack){
      //this.nav.push(recover['name'], {recover: recover['recover']});
    }
    //this.handleCameraRestart(event);
  }
  
  onPause(event:any) {
    console.log("On Pause: ");
    let views:Array<ViewController> = this.nav.getViews();
    let stack = [];
    for (let view of views){
      let recover:any = [];
      if (view.hasOwnProperty('onPause')){
        recover = (view as any).onPause(event);
      }
      stack.push({name: view.name, recover:recover});
    }
    this.configurations.configs['stack_pages'] = stack; 
    this.configurations.save().then(()=>console.log(event));
  }
  
  handleCameraRestart(event:any){
    if (event && event.pendingResult) {
      const status: string = event.pendingResult.pluginStatus !== null ? '' : event.pendingResult.pluginStatus.toUpperCase();
       if ('Camera' === event.pendingResult.pluginServiceName && 'OK' !== status && event.pendingResult.result !== '') {
          console.log("Hello");
          console.log(event.pendingResult);
          //this.myService.saveAndroidPhotoRecoveryURI(event.pendingResult.result);
       }
    }
  }

  
  //Called by externalDataProviderOnError, return a value for error propagation
  onError(reason, source){
    //User is not logged in
    if (reason.code == 4){
      this.externalData.setSession(null);
      this.configurations.configs['user'] = null;
      //delete this.configurations.configs['mode'];0=online, 1=offline
      this.configurations.save().then(()=>console.log(event));
      this.notificationServiceProvider.stop();
      this.nav.setRoot('LoginPage');
   
      return null;
    }
    else{
      return reason;
    }
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }

  onNotificationClick(notification, state){
    console.log(notification);
    console.log(state);
  }
}
