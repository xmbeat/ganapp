import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GanadoDetails } from './GanadoDetails';
@NgModule({
  declarations: [GanadoDetails],
  imports: [IonicPageModule.forChild(GanadoDetails)],
})
export class GanadoDetailsModule { }