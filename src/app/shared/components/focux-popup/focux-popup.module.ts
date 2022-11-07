import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {DividerModule} from '../../directives/divider/divider.module';
import {MatRippleModule} from '@angular/material/core';
import {HighlightSearchModule } from '../../pipes/highlight-search/highlight-search.module';
import { MatInputModule } from "@angular/material/input";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { FocuxPopupComponent } from './focux-popup.component';

import { MatTooltipModule } from '@angular/material/tooltip';
@NgModule({
  declarations: [
    FocuxPopupComponent
  ],
  exports:[
    FocuxPopupComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatDividerModule,
    MatFormFieldModule,
    DividerModule,
    MatRippleModule,
    HighlightSearchModule,
    HighlightSearchModule,
    MatInputModule,
    MatCheckboxModule,
    MatSliderModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatAutocompleteModule,
     MatTooltipModule,
     MatMenuModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class FocuxPopupModule { }
