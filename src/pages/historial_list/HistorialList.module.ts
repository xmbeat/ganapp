import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HistorialList } from './HistorialList';
@NgModule({
  declarations: [HistorialList],
  imports: [IonicPageModule.forChild(HistorialList)],
})
export class HistorialListModule {}