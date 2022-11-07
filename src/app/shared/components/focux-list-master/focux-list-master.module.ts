import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocuxListMasterComponent } from './focux-list-master.component';
import { PipesModule } from 'app/modules/admin/dashboards/assignment-occupation/pipes/pipes.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [FocuxListMasterComponent],
  imports: [
    CommonModule,
    PipesModule,
    MatPaginatorModule,
    RouterModule,
  ],
  exports: [
    FocuxListMasterComponent
  ],
})
export class FocuxListMasterModule { }
