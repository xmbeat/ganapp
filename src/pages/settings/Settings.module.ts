import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { Settings } from './Settings';
@NgModule({
  declarations: [Settings],
  imports: [IonicPageModule.forChild(Settings)],
})
export class SettingsModule {}