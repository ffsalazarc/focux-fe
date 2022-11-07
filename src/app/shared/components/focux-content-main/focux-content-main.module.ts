import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocuxContentMainComponent } from './focux-content-main.component';



@NgModule({
  declarations: [
    FocuxContentMainComponent
  ],
  exports: [
    FocuxContentMainComponent
  ],
  imports: [
    CommonModule
  ]
})
export class FocuxContentMainModule { }
