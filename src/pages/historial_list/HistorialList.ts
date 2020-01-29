import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { LocalDataProvider, HistorialModel } from '../../providers/globals/LocalDataProvider';
import { Configurations } from '../../providers/globals/Configurations';
import { ExternalDataProvider } from '../../providers/globals/ExternalDataProvider';
import { Language } from '../../providers/globals/Language';


@IonicPage()
@Component({
  selector: 'page-historial-list',
  templateUrl: 'HistorialList.html'
})
export class HistorialList {
  isLoading: boolean = false;
  lastIndex: number = 0;
  items: Array<{}> = [];
  filter: any;
  model: any = new HistorialModel();
  enqueueUpdate: boolean;
  searchText: string;
  ganado: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl:AlertController, 
    public localData: LocalDataProvider, public loading: LoadingController, public conf: Configurations,
    public externalData: ExternalDataProvider, public lang: Language) {

    this.ganado = navParams.get('ganado');
    if (this.ganado == null){
      this.navCtrl.popToRoot();
    }
    this.setFilter({});
  }
  
  refresh(forceUpdate = false){
    this.setFilter(this.filter, forceUpdate);
  }

  loadNextItems(): Promise<any> {
    let dataProvider: any;
    if (this.conf.configs['mode'] == 0){
      dataProvider = this.externalData;
    }
    else{
      dataProvider = this.localData;
    }
    
    return dataProvider.getHistorial(this.filter, 20, this.lastIndex, null, null, null, false)
    .then((historial:Array<any>) => { 
      for (let registro of historial){
        this.items.push(registro);
      }
      this.lastIndex += historial.length;
    })
    .catch((error)=>{
      console.log(error);
      let alert = this.alertCtrl.create({
        title:this.lang.get('error'), 
        message: this.lang.get('db-error-list') +": "+ error, 
        buttons: [{
          text: this.lang.get('ok')
        }]
      });
      alert.present();
    });
    
  }
  
  getYear(epochSeconds){
    let tmp = new Date(epochSeconds * 1000);
    return tmp.getUTCFullYear();
  }

  getShortMonth(epochSeconds){
    let tmp = new Date(epochSeconds * 1000);
    return this.lang.get('months-short')[tmp.getUTCMonth()];
  }



  setFilter(filter, forceUpdate = false){
    filter['ganado_id'] = this.ganado['id'];
    console.log("setFilter(): " + filter);
    this.filter = filter; 
    this.filter['borrado'] = 0;
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


  ionViewDidEnter(){
    if (this.enqueueUpdate){
      this.enqueueUpdate = false;
      let loader = this.loading.create({content:this.lang.get('db-list')});
      loader.present().then(()=>{
        this.loadNextItems().then(()=>{
          loader.dismiss();
        });
      })
    }
  }


  itemDelete(event, index){
    let dataProvider: any;
    if (this.conf.configs['mode'] == 0){
      dataProvider = this.externalData;
    }
    else{
      dataProvider = this.localData;
    }
    let registro = this.items[index];
    this.items.splice(index, 1);
    dataProvider.saveHistorial({id:registro['id'], borrado:1}).catch((error)=>{
      console.error(error);
    });
  }

  itemTapped(event, item) {
    this.navCtrl.push('HistorialDetails', {
      'historial': this.items[item],
      'ganado': this.ganado
    }).catch(()=>{});
  }


  filtrar(){
    this.navCtrl.push('HistorialFilter', {caller: this});
  }

  agregarRegistro(){
    this.navCtrl.push('HistorialDetails', {
      'historial': {ganado_id: this.ganado['id']},
      'ganado': this.ganado
    }).catch(()=>{});
  }

}

