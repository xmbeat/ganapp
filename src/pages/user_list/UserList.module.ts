import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserList } from './UserList';
@NgModule({
  declarations: [UserList],
  imports: [IonicPageModule.forChild(UserList)],
})
export class HistorialListModule {}