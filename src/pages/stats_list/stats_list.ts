import { NavController, IonicPage, NavParams, AlertController } from 'ionic-angular';
import { Configurations } from '../../providers/globals/Configurations';
import { Language } from '../../providers/globals/Language'
import { Component, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';

@IonicPage()
@Component({
  selector: 'page-stats-list',
  templateUrl: 'stats_list.html'
})
export class StatsListPage {
    onSelectListener:any = null;
    showOnlyList: boolean = false;
    items:Array<{name:string, filter:any, color:any}> = [];
    groupName = "";
    selectedColor = "rgb(200, 40, 40)";

	constructor(public navCtrl: NavController, public navParams: NavParams, public config: 
        Configurations, public lang: Language, public alertCtrl: AlertController) {
        this.onSelectListener = navParams.get('onSelectListener');
        this.showOnlyList = navParams.get('showOnlyList');
	}

    ionViewDidLoad(){
        this.items = this.config.configs['groups-data'];
        if (this.items == null){
            this.items = [];
        }
    }

    itemTapped(event, index){
        if (this.onSelectListener){
            this.onSelectListener.onSelectGroup(this.items[index]);
        }
        if (this.showOnlyList){
            this.navCtrl.pop();
        }
        else{
            this.navCtrl.push('StatsPage', {
                groups:[this.items[index]]
            }).catch((reason)=>{
                console.log(reason);
            });
        }
        
    }

    itemDelete(event, index){
        this.items.splice(index, 1);
        this.config.configs['groups-data'] = this.items;
        this.config.save().catch((reason)=>{
            console.log(reason);
        });
    }

    itemModify(event, index){

    }

    agregarGrupo(){
        for(let filter of this.items){
            if (this.groupName.toLowerCase() == filter.name.toLowerCase()){
                let alert = this.alertCtrl.create({
                    title: this.lang.get('db-error'),
                    message: this.lang.get('message-errors')[1],
                    buttons: [this.lang.get('ok')]
                });
              alert.present();
              return;
            }
        }
        this.navCtrl.push('GanadoFilter', {"caller": this});
    }

    setFilter(filter, forceUpdate = false){
        let num:any = Math.random();
        num = num * Math.pow(256, 3);
        num =  Math.round(num);
        num = num.toString(16);
        this.selectedColor = "#000000".substring(0, 7 - num.length) + num;
        console.log(this.selectedColor);
        this.items.push({name: this.groupName, filter:filter, color: this.selectedColor});
        this.groupName = "";
        this.config.configs['groups-data'] = this.items;
        this.config.save().catch((reason)=>{
            console.log(reason);
        });
    }
}
