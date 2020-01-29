import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GanadoInfoPage } from './ganado-info';

@NgModule({
  declarations: [
    GanadoInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(GanadoInfoPage),
  ],
})
export class GanadoInfoPageModule {}
