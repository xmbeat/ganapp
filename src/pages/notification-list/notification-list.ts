import { Language } from './../../providers/globals/Language';
import { LocalDataProvider } from './../../providers/globals/LocalDataProvider';
import { Configurations } from './../../providers/globals/Configurations';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { ExternalDataProvider } from '../../providers/globals/ExternalDataProvider';

/**
 * Generated class for the NotificationListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-notification-list',
  templateUrl: 'notification-list.html',
})
export class NotificationListPage {
  filter:any;
  items:any;
  fixedItems:any = [];
  lastIndex:number;
  enqueueUpdate:boolean;
  maps:any = [
    {image: 'parto.png', description: 'Parto registrado'},
    {image: 'heat.png', description: 'Calor registrado'},
    {image: 'enfermedad.png', description: 'Ganado enfermo'},
    {image: 'death.png', description: 'Muerte de ganado'},
    {image: 'inseminacion.png', description: 'Verificar embarazo con tacto'},
    {image: 'inseminacion.png', description: 'Verificar embarazo con prueba sanguinea'},
    {image: 'parto.png', description:'Vaca proxima a parir'},
    {image: 'female.png', description: 'Becerro nuevo registrado'},
    {image: 'scale.png', description: 'Primer pesaje'},
    {image: 'scale.png', description: 'Segundo pesaje'}
  ];
  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl:AlertController, 
    public localData: LocalDataProvider, public loading: LoadingController, public conf: Configurations,
    public externalData: ExternalDataProvider, public lang: Language) {
    this.setFilter(navParams.get('filter'));
  }

  refreshFilter(){
    this.setFilter(this.filter, true);
  }

  ionViewDidEnter() {
    if (this.enqueueUpdate){
      this.enqueueUpdate = false;
      let loader = this.loading.create({content:'Obteniendo notificaciones'});
      loader.present().then(()=>{
        this.loadNextItems().then(()=>{
            return this.loadFixedItems();
        })
        .catch(error=>{
          console.log(error);
        })
        .then(()=>{
          loader.dismiss();
        });
      })
      
    }
  }

  openPageByItem(item:any){
    //Abrimos el historial
    if (item.tipo < 6){      
      this.navCtrl.push('HistorialDetails', {
        'historial': {id:item.referencia.id}
      }).catch((error)=>{
        console.error(error);
      });
    }
    //Abrimos el ganado
    else{
      this.navCtrl.push('GanadoDetails', {
        'ganado': {
          id:item.referencia.id
        }
      }).catch((error)=>{
        console.error(error);
      });
    }
    this.externalData.saveNotificacion({
      id: item.id,
      status: 1
    }).catch(error=>{});
  }

  refresh(forceUpdate = false){
    this.setFilter(this.filter, forceUpdate);
  }

  loadFixedItems(): Promise<any>{
    let time_now = Math.round(new Date().getTime() / 1000);
    let filter = {fin__gte: time_now, inicio__lte: time_now};
    return this.externalData.getNotifications(filter, 0, 0, ['fecha'], 0, null, true)
    .then((notificaciones:Array<any>)=>{
      this.fixedItems = [];
      if (notificaciones){
        for (let notificacion of notificaciones){
          notificacion.tipo = parseInt(notificacion.tipo);
          if (notificacion.tipo < 7){
            if (notificacion.referencia.ganado.siniiga){
              notificacion.description = 'Bovino con siniiga: ' + notificacion.referencia.ganado.siniiga ;
            }
            else{
              notificacion.description = 'Bovino con tatuaje: ' + notificacion.referencia.ganado.tatuaje ;
            }
            
          }
          else{
            if (notificacion.referencia.siniiga){
              notificacion.description = 'Bovino con siniiga: ' + notificacion.referencia.siniiga ;
            }
            else{
              notificacion.description = 'Bovino con tatuaje: ' + notificacion.referencia.tatuaje ;
            }
          }
          this.fixedItems.push(notificacion);
        }
        //this.lastIndex += notificaciones.length;
      }
     
    })
    .catch((error)=>{
      let alert = this.alertCtrl.create({
        title:this.lang.get('error'), 
        message: this.lang.get('db-error-list') +": "+ JSON.stringify(error), 
        buttons: [{
          text:this.lang.get('ok')
        }]
      });
      alert.present();
    });
  }

  loadNextItems(): Promise<any> {
    let time_now = Math.round(new Date().getTime() / 1000);
    let dataProvider = this.externalData;
    if (this.filter == null){
      this.filter = {
        fin__lte: time_now 
      };
    }
    //this.filter['borrado'] = 0;
    return dataProvider.getNotifications(this.filter, 20, this.lastIndex, ["status"], 0, null, true)
    .then((notificaciones:Array<any>) => { 
      if (notificaciones){
        for (let notificacion of notificaciones){
          notificacion.tipo = parseInt(notificacion.tipo);
          this.items.push(notificacion);
          if (notificacion.tipo < 7){
            if (notificacion.referencia.ganado.siniiga){
              notificacion.description = 'Bovino con siniiga: ' + notificacion.referencia.ganado.siniiga ;
            }
            else{
              notificacion.description = 'Bovino con tatuaje: ' + notificacion.referencia.ganado.tatuaje ;
            }
            
          }
          else{
            if (notificacion.referencia.siniiga){
              notificacion.description = 'Bovino con siniiga: ' + notificacion.referencia.siniiga ;
            }
            else{
              notificacion.description = 'Bovino con tatuaje: ' + notificacion.referencia.tatuaje ;
            }
          }
        }
        this.lastIndex += notificaciones.length;
      }
    })
    .catch((error)=>{
      let alert = this.alertCtrl.create({
        title:this.lang.get('error'), 
        message: this.lang.get('db-error-list') +": "+ JSON.stringify(error), 
        buttons: [{
          text:this.lang.get('ok')
        }]
      });
      alert.present();
    });
 
  }

  setFilter(filter, forceUpdate = false){
    this.filter = filter;  
    this.lastIndex = 0;
    this.items = [];
    
    if (forceUpdate){
      this.enqueueUpdate = true;
      this.ionViewDidEnter();
    }
    else{
      this.enqueueUpdate = true;
    }
  }


}
