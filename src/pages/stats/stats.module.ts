import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ComponentsModule } from '../../components/components.module';
import { StatsPage } from './stats';
@NgModule({
  declarations: [StatsPage],
  imports: [IonicPageModule.forChild(StatsPage), ComponentsModule],
})
export class StatsPageModule { }