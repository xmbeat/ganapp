import { NgModule } from '@angular/core';
import { ExpandableComponent } from './expandable/expandable';
import { IonicPageModule } from 'ionic-angular';
@NgModule({
	declarations: [ExpandableComponent],
	imports: [    IonicPageModule.forChild(ExpandableComponent)],
	exports: [ExpandableComponent]
})
export class ComponentsModule {}
