import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FocuxListMasterComponent } from './components/focux-list-master/focux-list-master.component';
import { FocuxButtonModule } from './components/focux-button/focux-button.module';
import { FocuxSpinnerModule } from './components/focux-spinner/focux-spinner.module';
import { FocuxSearchModule } from './components/focux-search/focux-search.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FocuxButtonModule,
        FocuxSearchModule,
        FocuxSpinnerModule,
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FocuxButtonModule,
        FocuxSearchModule,
        FocuxSpinnerModule,
    ],
    declarations: [
    ]
})
export class SharedModule {
}
