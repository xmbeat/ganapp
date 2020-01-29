import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { LocalDataProvider, HistorialModel } from '../../providers/globals/LocalDataProvider';
import { Configurations } from '../../providers/globals/Configurations';
import { ExternalDataProvider } from '../../providers/globals/ExternalDataProvider';
import { Language } from '../../providers/globals/Language';


@IonicPage()
@Component({
  selector: 'page-user-list',
  templateUrl: 'UserList.html'
})
export class UserList {
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
    
    return dataProvider.getUsers(this.filter, 20, this.lastIndex)
    .then((users:Array<any>) => { 
      for (let registro of users){
        this.items.push(registro);
      }
      this.lastIndex += users.length;
    })
    .catch((error)=>{
      console.log(error);
      // let alert = this.alertCtrl.create({
      //   title:this.lang.get('error'), message: this.lang.get('db-error-list') +": "+ error, buttons: [{text:this.lang.get('ok')}]});
      // alert.present();
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

  ionViewCanEnter(){
    
    if (this.conf.configs['mode'] == 0){
      return true;
    }
    else{
      let alert = this.alertCtrl.create({
        title: this.lang.get('error'),
        message: this.lang.get('mode-online-only'),
        buttons: [{
          text: this.lang.get('ok')
        }]
      });
      alert.present();
      return false;
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
      let usuario = this.items[index];

      dataProvider.deleteUser({id:usuario['id']}).catch((error)=>{
        console.error(error);
      });
      this.items.splice(index, 1);
    }
  }

  itemTapped(event, item) {
    // That's right, we're pushing to ourselves!
    this.navCtrl.push('UserDetails', {
      item: this.items[item]
    }).catch(()=>{});
  }


  agregarRegistro(){
    this.navCtrl.push('UserDetails').catch(()=>{});
  }

}

