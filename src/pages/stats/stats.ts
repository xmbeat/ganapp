import { NavController, IonicPage, NavParams, LoadingController} from 'ionic-angular';
import { Component, ViewChildren, ViewChild, QueryList} from '@angular/core';
import { Chart } from 'chart.js';
import { ExternalDataProvider } from '../../providers/globals/ExternalDataProvider';
import { LocalDataProvider } from '../../providers/globals/LocalDataProvider';
import { CustomAlerts } from '../../components/CustomAlerts';
import { Language } from '../../providers/globals/Language';
import { Configurations } from '../../providers/globals/Configurations';

@IonicPage()
@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html'
})
export class StatsPage {
    @ViewChildren('lineCanvas') lineCanvas: QueryList<any>;
     
    barChart: any;
    doughnutChart: any;
    lineChart: Array<Chart> = [];
    groups:Array<any> = [];
    ganado:any = null;

    selected_groups: any;
    //Columnas que se usaran para sacar las estadisticas
    stat_columns = ['peso_nacimiento', 'peso_destete', 'peso_anual'];

	constructor(public navCtrl: NavController, public navParams: NavParams, public localData: LocalDataProvider, 
        public externalData: ExternalDataProvider, public loading: LoadingController, public lang: Language, public conf: Configurations) {
        
	}

    calculateStats(dataset:Array<any>, field:string):any{
        let result:any = {
            average: 0,
            deviation: 0,
            sorted: [],
            excluded:[]
        };
        let sum:number = 0;
        let avg:number = 0;
        let count:number = 0;
        
        for (let i = 0; i < dataset.length; i++){
            if (dataset[i][field] != null && dataset[i][field] != ""){                
                sum += dataset[i][field] = Number.parseFloat(dataset[i][field]);
                count++;
                result.sorted.push(dataset[i]);
            }
            else{
                result.excluded.push(dataset[i]);
            }
        }

        //Ordenamos los resultados segun el campo
        result.sorted = result.sorted.sort((a, b)=>{
            return a[field] - b[field];
        });

        if (count > 0 ){
            result.average = sum / count;
            //Calculamos la desviacion estandar
            sum = 0;
            for (let i = 0; i < result.sorted.length; i++){
                let number = Number.parseFloat(result.sorted[i][field]);
                sum += Math.pow(number - result.average, 2);
            }
            result.deviation = Math.sqrt(sum);
        }

        return result;
    }

    addGroup(){
        this.navCtrl.push('StatsListPage', {
            onSelectListener: this,
            showOnlyList: true,
        }).catch((reason)=>{
            console.log(reason);
        });
    }

    onSelectGroup(group: any){
        this.addGroups([group]).then((result)=>{
          
        })
    }

    addGroups(groups:Array<any>): Promise<any>{
        let result: Promise<any>
        let provider: any = null;
        if (this.conf.configs['mode']){
            provider = this.localData;
        }
        else{
            provider = this.externalData;
        }
        let loader = this.loading.create({content:this.lang.get('db-list')});

        return  loader.present().then(()=>{
            //Recuperamos los datasets de todos los grupos
            
            let columns = ['id', 'siniiga', 'tatuaje', 'sexo'].concat(this.stat_columns);
            let promise:Promise<any> = null;
            let fetcher = (index)=>{
                return provider.getGanado(groups[index].filter, 0, 0, null, null, columns)
                .then(results=>{
                    if (results.length > 0){
                        groups[index].stats = [];
                        for(let i = 0; i < this.stat_columns.length; i++){
                            groups[index].stats.push(this.calculateStats(results, this.stat_columns[i]));
                        }
                        groups[index].results = results;
                        this.groups.push(groups[index]);
                    }
                    return results;
                });
            };

            for(let i = 0; i < groups.length; i++){
                if (promise == null){
                    promise = fetcher(i);
                }
                else{
                    promise = promise.then((results)=>{
                        return fetcher(i);
                    })
                }
            }
            return promise;
        })
        .then(()=>{
            let canvas:Array<any> = this.lineCanvas.toArray();
            //Reiniciamos los charts anteriores, si es que habia
            for (let chart of this.lineChart){
                chart.destroy();
            }
            this.lineChart = [];

            //Recorremos las columnas que se graficaran.
            for (let column = 0; column < this.stat_columns.length; column++){
                let datasets = [];
                let axisConf = [];
                let largest = 0;
                let lowest = null;
                //Recorremos los grupos donde extraeremos los datos a graficar para esta columna
                for(let g = 0; g < this.groups.length; g++){
                    let group = this.groups[g];
                    let stats = group.stats[column].sorted;
                    let data: any = {};
                    if (stats.length){
                        data.label = group.name;
                        data.data = stats.map((item, index)=>{
                            let value = item[this.stat_columns[column]];
                            if (value > largest){
                                largest = value;
                            }
                            if (lowest == null || value < lowest){
                                lowest = value;
                            }
                            return {x: index, y: item[this.stat_columns[column]]};
                        });
                        data.backgroundColor = group.color;
                        data.type = "line";
                        data.borderColor =  group.color;
                        data.pointRadius = 2;
                        data.fill = false;
                        data.xAxisID = 'axisX-' + g;
                        datasets.push(data);
                        axisConf.push({
                            id:data.xAxisID,
                            type: 'linear',
                            display: false,
                            position: 'bottom',
                            ticks: {
                                min: 0,
                                max: data.data.length - 1
                            }
                        });
                    }
                   
                }

                let options = {
                    responsive: true,
                    title: {
                      display: false,
                      text: 'Chart.js - Line Chart With Multiple X Scales (X Axes)'
                    },
                    tooltips: {
                      mode: 'nearest',
                      intersect: true,
                      callbacks: {
                          label: (tooltip, data)=>{
                              let dataset = data.datasets[tooltip.datasetIndex];
                              let index = dataset.data[tooltip.index].x;
                              let ganado = this.groups[tooltip.datasetIndex].stats[column].sorted[index];
                              let measure = tooltip.yLabel + " KG\t";
                              let label = measure + "ID: " + (ganado.siniiga || ganado.tatuaje);
                              return label;
                          }
                      }
                    },
                    scales: {
                        xAxes: axisConf,
                        yAxes: [
                        {
                            ticks: {
                                min: lowest,
                                max: largest
                            }
                        }]
                    }
                }

               
                let param = {
                    labels: ['a', 'b', 'c', 'd', 'e'],
                    datasets: datasets
                };
                

                this.lineChart.push(new Chart(canvas[column].nativeElement, {
                    type: 'line',
                    data: param,
                    options: options
                }));
                
            }
            

        })
        .catch(reason=>{
            console.log(reason);
        })
        .then(()=>{
            loader.dismiss();
        });
    }

	ionViewDidLoad() {
        this.addGroups(this.navParams.get('groups'));        
	}
}
