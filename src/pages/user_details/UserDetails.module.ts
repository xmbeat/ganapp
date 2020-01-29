import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserDetails } from './UserDetails';
@NgModule({
  declarations: [UserDetails],
  imports: [IonicPageModule.forChild(UserDetails)],
})
export class UserDetailsModule { }