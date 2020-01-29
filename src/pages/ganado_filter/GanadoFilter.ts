import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { LocalDataProvider, GanadoModel } from '../../providers/globals/LocalDataProvider';
import { GanadoList } from '../ganado_list/GanadoList';
import { Language } from '../../providers/globals/Language';
@IonicPage()
@Component({
  selector: 'page-ganado-filter',
  templateUrl: 'GanadoFilter.html'
})
export class GanadoFilter {
  nacimiento:any = {
    peso: {lower:0, upper: 80},
    peso_enabled: true,
    fecha_enabled: false,
    fecha: {from:0, until:0}
  };
  destete:any = {
    peso: {lower:80, upper: 500},
    peso_enabled: false
  };
  anual:any = {
    peso: {lower:180, upper: 700},
    peso_enabled: false,
    talla: {lower: 100, upper: 400},
    talla_enabled: false,
  };
  otros:any = {
    edad: {lower: 0, upper: 30},
    edad_enabled: false
  };
  model: any = new GanadoModel();
  status: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl:AlertController, 
    public dataProvider: LocalDataProvider, public loading: LoadingController, public lang: Language) {
    
    
  }


  ionViewDidEnter(){

  }

  ionViewDidLoad(){

  }

  filtrar(){
    let filter = {};
    

    if (this.nacimiento.peso_enabled)
        filter['peso_nacimiento__btw'] = [this.nacimiento.peso.lower, this.nacimiento.peso.upper];
    if (this.destete.peso_enabled)
      filter['peso_destete__btw'] = [this.destete.peso.lower, this.destete.peso.upper];
    if (this.anual.peso_enabled)
      filter['peso_anual__btw'] = [this.anual.peso.lower, this.anual.peso.upper];
    if (this.anual.talla_enabled)
      filter['talla_corporal__btw'] = [this.anual.talla.lower, this.anual.talla.upper];
    if (this.nacimiento.fecha_enabled){
      let from = new Date(this.nacimiento.fecha.from);
      let until = new Date(this.nacimiento.fecha.until);
      filter['fecha_nacimiento__btw'] = [from.getTime() / 1000, until.getTime() / 1000]
    }
    // if (this.otros.edad_enabled) {
    //   let now = new Date();
    //   let a = now.getTime() - this.otros.edad.lower * 365 *  24 * 60 * 60;
    //   let b = now.getTime() - this.otros.edad.upper * 365 * 24 * 60 * 60;
    //   filter['fecha_nacimiento__btw'] = [a, b];
    // }

    if (this.status && this.status.length > 0){
      filter['status__in'] = this.status;
    }
    let listGanado:GanadoList = this.navParams.get("caller");
    listGanado.setFilter(filter);
    this.navCtrl.pop();
  }

}
