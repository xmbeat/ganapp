import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { LocalDataProvider, GanadoModel } from '../../providers/globals/LocalDataProvider';
import { HistorialList } from '../historial_list/HistorialList';
import { Language } from '../../providers/globals/Language';
@IonicPage()
@Component({
  selector: 'page-historial-filter',
  templateUrl: 'HistorialFilter.html'
})
export class HistorialFilter {
  date:any = {
    enabled: false,
    from: null,
    to: null
  };

  types:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl:AlertController, 
    public dataProvider: LocalDataProvider, public loading: LoadingController, public lang: Language) {
    
    
  }


  ionViewDidEnter(){

  }

  ionViewDidLoad(){

  }

  filtrar(){
    let filter = {};
    

    if (this.date.enabled){
      if (this.date.from != null){
           filter['fecha__gte'] = new Date(this.date.from).getTime() / 1000;
      }
      if (this.date.to != null){
        filter['fecha__lte'] = new Date(this.date.to).getTime() / 1000;
      }
    }
    
    if (this.types && this.types.length > 0){
      filter['tipo__in'] = this.types;
    }
    

    /*if (this.otros.edad_enabled) {
      let now = new Date();
      let a = now.getTime() - this.otros.edad.lower * 365 *  24 * 60 * 60;
      let b = now.getTime() - this.otros.edad.upper * 365 * 24 * 60 * 60;
      filter['fecha_nacimiento__btw'] = [a, b];
    }*/
    let historialList:HistorialList = this.navParams.get("caller");
    filter['ganado_id'] = historialList.filter['ganado_id'];
    historialList.setFilter(filter);
    this.navCtrl.pop();
  }

}
