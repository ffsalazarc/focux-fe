import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FocuxSpinnerComponent } from './focux-spinner.component';
import { NgxSpinnerModule } from 'ngx-spinner';



@NgModule({
  declarations: [
    FocuxSpinnerComponent,
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    NgxSpinnerModule,

  ],
  exports: [
    FocuxSpinnerComponent,
  ]
})
export class FocuxSpinnerModule { }
