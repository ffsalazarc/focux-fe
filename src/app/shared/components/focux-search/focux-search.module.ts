import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocuxSearchComponent } from './focux-search.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';




@NgModule({
    declarations: [FocuxSearchComponent],
    exports: [
        FocuxSearchComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatDividerModule,
        MatInputModule,
        MatFormFieldModule,
        MatButtonModule



    ]
})
export class FocuxSearchModule {
}