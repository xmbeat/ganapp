import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { LocalDataProvider, GanadoModel } from '../../providers/globals/LocalDataProvider';
import { Configurations } from '../../providers/globals/Configurations';
import { ExternalDataProvider } from '../../providers/globals/ExternalDataProvider';
import { Language } from '../../providers/globals/Language';
@IonicPage()
@Component({
  selector: 'page-ganado-list',
  templateUrl: 'GanadoList.html'
})
export class GanadoList {
  wannaSearch: boolean = false;
  isLoading: boolean = false;
  lastIndex: number = 0;
  items: Array<{}> = [];
  filter: any;
  model: any = new GanadoModel();
  enqueueUpdate: boolean;
  searchText: string;
  selectOnly:boolean = false;
  onSelectListener:any = null;
  extra: null;

  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl:AlertController, 
    public localData: LocalDataProvider, public loading: LoadingController, public conf: Configurations,
    public externalData: ExternalDataProvider, public lang: Language) {
    this.setFilter(navParams.get('filter'));
    this.selectOnly = navParams.get('selectOnly');
    this.onSelectListener = navParams.get('onSelectListener');
    this.extra = navParams.get('extra');
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
    if (this.filter == null){
      this.filter = {};
    }
    this.filter['borrado'] = 0;
    return dataProvider.getGanado(this.filter, 20, this.lastIndex, null, null, ['id','siniiga', 'tatuaje', 'nombre', 'fecha_nacimiento', 'status', 'sexo'])
    .then((ganado:Array<any>) => { 
      if(ganado){
        for (let becerro of ganado){
          if (becerro.fecha_nacimiento){
            let seconds = new Date().getTime() / 1000;
            seconds = seconds - becerro.fecha_nacimiento;
            becerro.edad = this.secondsToAge(seconds);
          }
          becerro.identificadores = this.idsToString(becerro);
          this.items.push(becerro);
        }
        this.lastIndex += ganado.length;
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

  idsToString(becerro:any){
    let result = "";
    if (becerro.nombre){
      result += becerro.nombre;
    }
    if (becerro.siniiga){
      if (result.length > 0){
        result += " | ";
      }
      result += becerro.siniiga;
    }
    if (becerro.tatuaje){
      if (result.length > 0){
        result += " | ";
      }
      result += becerro.tatuaje;
    }
    return result;
  }

  secondsToAge(seconds){
    let secondsInMonth = 30 * 24 * 60 * 60;
    let secondsInYear = 365 * 24 * 60 * 60;
    let years = Math.floor(seconds / secondsInYear);
    let months = Math.floor((seconds % secondsInYear) / secondsInMonth);

    let result = "";
    if (years > 1 ){
      result = years + " " + this.lang.get('years') + ", ";
    }
    else if (years == 1){
      result = years + " " + this.lang.get('year') + ", ";
    }
    if (months >  1 || months == 0){
      result += months + " " + this.lang.get('months');
    }
    else{
      result += months + " " + this.lang.get('month');
    }
    return result;
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

  openHistory(event, index){
    this.navCtrl.push('HistorialList', {
      'ganado': this.items[index]
    })
    .catch((error)=>{
      console.error(error);
    });
  }

  openStats(event, index){

  }

  itemDelete(event, index){
    let dataProvider: any;
    if (this.conf.configs['mode'] == 0){
      dataProvider = this.externalData;
    }
    else{
      dataProvider = this.localData;
    }
    let ganado = this.items[index];

    dataProvider.saveGanado({id:ganado['id'], borrado:1}).catch((error)=>{
      console.error(error);
    });
    this.items.splice(index, 1);
  }

  itemSold(event, index){
    let dataProvider: any;
    if (this.conf.configs['mode'] == 0){
      dataProvider = this.externalData;
    }
    else{
      dataProvider = this.localData;
    }
    let ganado = this.items[index];
    ganado['status'] = 2;
    dataProvider.saveGanado({id:ganado['id'], status:ganado['status']}).catch(()=>{});
  }

  itemTapped(event, item) {

    if (this.onSelectListener){
      this.onSelectListener.onSelect(this.items[item], this.extra);
    }

    if (this.selectOnly){
      this.navCtrl.pop().catch((reason)=>console.log(reason));
    }
    else{
      this.navCtrl.push('GanadoDetails', {
        'ganado': this.items[item]
      }).catch((error)=>{
        console.error(error);
      });
    }
   
  }


  filtrar(){
    this.navCtrl.push('GanadoFilter', {"caller": this});
  }

  agregarRegistro(){
    this.navCtrl.push('GanadoDetails', {
      'template':{
        'borrado':0
      }
    });
  }

  onSearchInput(event){
  }

  search(){
    if (this.searchText && this.searchText.length > 0){
      let pattern = "%" + this.searchText + "%";
      this.setFilter({__or:{siniiga__like: pattern, tatuaje__like: pattern, nombre__like: pattern}}, true);
    }
  }
  onSearchCancel(event){
    this.wannaSearch = false;
  }
}

