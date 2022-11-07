import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocuxButtonComponent } from './focux-button.component';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [FocuxButtonComponent],
  exports: [
    FocuxButtonComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule
  ]
})
export class FocuxButtonModule {
}
