import { Injectable, ViewChild } from '@angular/core';
import { Platform,Nav} from 'ionic-angular';
import { ExternalDataProvider } from "./ExternalDataProvider";
import { LocalNotifications } from "@ionic-native/local-notifications";
import { BackgroundMode } from '@ionic-native/background-mode';
import { BackgroundFetch, BackgroundFetchConfig } from '@ionic-native/background-fetch';


@Injectable()
export class NotificationServiceProvider{
  private nav : Nav = null;
  private timeout = 60000 * 3; // 1 minute X 3
  private continue : boolean = false;

  constructor( public backgroundFetch : BackgroundFetch, public backgroundMode : BackgroundMode,
              public platform: Platform, 
              public externalDataProvider : ExternalDataProvider, public localNotifications : LocalNotifications) {}
 

  run(nav: Nav){
    this.nav = nav;
    this.localNotifications.on('click').subscribe(
      (data) => { 
        this.nav.push('NotificationListPage');
      },
      (error) => {
        console.log(error);
      },
      () => {}
    );
  }

  start(){
    this.continue = true;
    if(this.platform.is('android')){
      this.backgroundMode.enable();
      this.startAndroidBackground();
    }
    if(this.platform.is('ios')){
      this.checkAndShowNotifications();
      const config = {
      
        minimumFetchInterval: 3, // <-- default is 15
        // stopOnTerminate: false,   // <-- Android only
        // startOnBoot: true,        // <-- Android only
        // forceReload: true         // <-- Android only
        stopOnTerminate: false, // Set true to cease background-etch from operating after user "closes" the app. Defaults to true.
      };
      this.backgroundFetch.configure(config)
        .then(() => {

          console.log('IONIC: Background Fetch initialized');
          this.checkAndShowNotifications();
          this.backgroundFetch.finish();

        })
        .catch(e => console.log('Error initializing background fetch', e));

      // Start the background-fetch API. Your callbackFn provided to #configure will be executed each time a background-fetch event occurs.
      // NOTE the #configure method automatically calls #start. You do not have to call this method after you #configure the plugin
      //this.backgroundFetch.start();

      // Stop the background-fetch API from firing fetch events. Your callbackFn provided to #configure will no longer be executed.
      //this.backgroundFetch.stop();
    }
  }

  stop(){
    this.continue = false;
    if(this.platform.is('android')){
       this.backgroundMode.disable().catch(error=>console.log(error));
    }
    if(this.platform.is('ios')){
      this.backgroundFetch.stop().catch(error=>console.log(error));
    }
  }

  //TODO restructuara metodo posible memory leak  USE SETTITMER
  //SERVICE STARTS HERE.
  protected sleep(){
    return new Promise((resolve) => {setTimeout(resolve, this.timeout)});
  }
  public async startAndroidBackground(){

    this.checkAndShowNotifications();

    await this.sleep().then(()=>{}).catch(e => {console.log(e)});

    if(this.continue){
      this.startAndroidBackground();
    }
  }
  //SERVICE ENDS HERE

  getNotifications(){
    return this.externalDataProvider.getNotifications()
  }


  checkAndShowNotifications(){
    let time_now = Math.round((new Date).getTime()/1000);
    this.externalDataProvider.getNotifications({inicio__lte:time_now,fin__gte:time_now,
      dia_procesado__not:this.time_now_round()},0,0,null,null,null,true).then((notifications)=>{
        if(notifications && notifications.length > 0 ){
          let title = '';
          let identifier = '';
          let text = '';
          let options;
          //TODO make a cleaner way of getting ganado info from notifications
          for(let notification of notifications){
            if(notification['tipo'] >= 0 && notification['tipo'] < 7){
              if (notification['referencia']['ganado']['siniiga'] !== undefined && notification['referencia']['ganado']['siniiga'] != null){
                identifier = 'siniiga ' + notification['referencia']['ganado']['siniiga'];
              }else if(notification['referencia']['ganado']['tatuaje'] !== undefined && notification['referencia']['ganado']['tatuaje'] != null){
                identifier = 'tatuaje ' + notification['referencia']['ganado']['tatuaje'];
              }else if(notification['referencia']['ganado']['nombre'] !== undefined && notification['referencia']['ganado']['nombre'] != null){
                identifier = 'nombre ' + notification['referencia']['ganado']['nombre'];
              }else if(notification['referencia']['ganado'] !== undefined){
                identifier = 'id ' + notification['referencia']['id']['ganado'];
              }else{
                identifier = 'DESCONOCIDO';
              }
            }else if(notification['tipo'] > 6 && notification['tipo'] < 10){
              if (notification['referencia']['siniiga'] !== undefined && notification['referencia']['siniiga'] != null){
                identifier = 'siniiga ' + notification['referencia']['siniiga'];
              }else if(notification['referencia']['tatuaje'] !== undefined && notification['referencia']['tatuaje'] != null){
                identifier = 'tatuaje ' + notification['referencia']['tatuaje'];
              }else if(notification['referencia']['nombre'] !== undefined && notification['referencia']['nombre'] != null){
                identifier = 'nombre ' + notification['referencia']['nombre'];
              }else if(notification['referencia'] !== undefined){
                identifier = 'id ' + notification['id']['referencia'];
              }else{
                identifier = 'DESCONOCIDO';
              }
            }
        		// 0 $PARTO 
            // 1 $CALOR 
            // 2 $ENFERMEDAD 
            // 3 $MUERTE 
            // 4 $CHECAR_EMBARAZO 
            // 5 $VERIFICAR_ENBARAZO 
            // 6 $PROXIMO_PARIR 
            // 7 $BECERRO_NUEVO
            // 8 $PESAJE_DESTETE
            // 9 $PESAJE_ANUAL
            switch (+notification['tipo']) {
              case 0://Parto
                title += 'Parto de Vaca';
                text += 'La vaca con ' + identifier + ' pario.';
                // if (notification['historial']['tipo'] !== undefined){
                //   switch (+notification['historial']['tipo']) {
                //     case 0:
                //       text += ' pario sin dificultad.\n';
                //       break;
                //     case 1:
                //       text += ' pario con leve dificultad.\n';
                //       break;
                //     case 2:
                //       text += ' pario con mayor dificultad.\n';
                //       break;
                //     case 3:
                //       text += ' pario por cesarea.\n';
                //       break;
                //     case 4:
                //       text += ' tuvo una presentacion anormal.\n';
                //       break;
                //     case 5:
                //       text += ' tuvo una muerte al parto.\n';
                //       break;
                //     case 6:
                //       text += ' tuvo un aborto prematuro.\n';
                //       break;
                //     default:
                //       text += ' pario.\n';
                //   }
                // }
                break;
              case 1://Calor
                title += 'Vaca en Calor';
                text += 'Vaca con ' + identifier + ' entro en calor.\n';

                break;
              case  2://Enfermedad   
                title += 'Ganado Enfermo';
                text += 'Ganado con ' + identifier + ' se encuentra enfermo.\n';
                break;
              case 3://Muerte
                title += 'Ganado Murio';
                text += 'El ganado con ' + identifier + ' murio.\n';
                // if (notification['historial']['tipo'] !== undefined){
                //   switch (+notification['historial']['tipo']) {
                //     case 0://Natural
                //       text += ' murio por causas naturales.\n';
                //       break;
                //     case 1://Enfermedad
                //       text += ' murio a causa de una enfermedad.\n';
                //       break;
                //     case 2://Desastre
                //       text += ' murio por un desastre natural.\n';
                //       break;
                //     case 3://Depredador
                //       text += ' murio por un depredador.\n';
                //       break;
                  
                //     default:
                //       text += ' murio.\n';
                //   }
                // }
                break;
              case 4://Checar Enbarazo
                title += 'Checar Embarazo';
                text += 'Cheque posible embarazo de la vaca con ' + identifier + '\n';

                break;
              case 5://Verificar Enbarazo
                title += 'Verifique Embarazo';
                text += 'Prueba de embarazo de la vaca con ' + identifier + ' requerida.\n';

                break;
              case 6://Proximo Parir
                title += 'Vaca Proxima a Parir';
                text += 'Vaca con ' + identifier + ' esta por parir.\n';
                
                break;
              case 7://Becerro nuevo
                title += 'Nuevo Ganado Registrado';
                text += 'Se registro un nuevo gando con ' + identifier + '\n';
               

                break;
              case 8://Pesaje Destete
                title += 'Pesaje al Destete';
                text += 'Ganado con ' + identifier + ' requiere el pesaje al destete.\n';

                break;
              case 9://Pesaje Anual
                title += 'Pesaje al Año';
                text += 'Ganado ' + identifier + ' requiere el pesaje al año.\n';
                

                break;
            }
          }
         
          if (notifications.length > 1){
            title = 'Varias Notificaciones'
          }
          options = {
            title : title,
            text : text,
            data : notifications[0]
            //trigger : {at : new Date(new Date().getTime() + datos.tiempo)}
          };
          this.localNotifications.schedule(options);
        }
    }).catch((error)=>{
      console.log(error);
    });
  }

  private time_now_round() : number{
    let objFecha = new Date();
    let objFecha2 = new Date((objFecha.getMonth()+1)+"/"+objFecha.getDate()+'/'+objFecha.getFullYear());
    return objFecha2.getTime()/1000;
  }
}
