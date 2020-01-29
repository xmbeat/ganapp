import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GanadoList } from './GanadoList';
@NgModule({
  declarations: [GanadoList],
  imports: [IonicPageModule.forChild(GanadoList)],
})
export class GanadoListModule {}