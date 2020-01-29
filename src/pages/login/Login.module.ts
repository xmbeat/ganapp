import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginPage } from './Login';
@NgModule({
  declarations: [LoginPage],
  imports: [IonicPageModule.forChild(LoginPage)],
})
export class LoginPageModule { }