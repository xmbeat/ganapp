import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StatsListPage } from './stats_list';
@NgModule({
  declarations: [StatsListPage],
  imports: [IonicPageModule.forChild(StatsListPage)],
})
export class StatsListPageModule { }