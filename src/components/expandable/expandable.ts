import { Component, Input, ViewChild, ElementRef, Renderer } from '@angular/core';
 
@Component({
  selector: 'expandable',
  templateUrl: 'expandable.html'
})
export class ExpandableComponent {

    @ViewChild('expandWrapper', {read: ElementRef}) expandWrapper;
    mCollapsed = false;
    @Input('maxHeight') maxHeight = 500;
    fixed_container:any;
    dynamic_container:any;
    icon:any;
  
    @Input()
    set collapsed(value:boolean){
      this.mCollapsed = value;
      if (this.dynamic_container){
        
        this.renderer.setElementClass(this.dynamic_container, 'collapsed', this.collapsed);
      }
      if (this.icon){
        this.renderer.setElementClass(this.icon, 'expanded', !this.collapsed);
      }
    }

    get collapsed():boolean{
      return this.mCollapsed;
    }

    constructor(public renderer: Renderer) {
      
    }
 
    ngAfterViewInit(){
      this.fixed_container = this.expandWrapper.nativeElement.querySelector('.fixed');
      this.dynamic_container = this.expandWrapper.nativeElement.querySelector('.dynamic');
      this.icon = this.expandWrapper.nativeElement.querySelector('.expand-icon');
      
      if (this.fixed_container){
        this.renderer.listen(this.fixed_container, 'click', (event)=>{
          this.collapsed = !this.collapsed;
        });
      }
      if (this.dynamic_container){
        this.renderer.setElementStyle(this.dynamic_container, 'max-height', this.maxHeight + 'px');
      }
      //Esto se ve feo, pero es necesario
      this.collapsed = this.collapsed;
    }
 
}