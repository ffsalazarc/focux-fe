import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatRadioModule} from '@angular/material/radio';
import {MatRippleModule, MAT_DATE_LOCALE} from "@angular/material/core";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatSliderModule} from '@angular/material/slider';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SearchBoxModule} from "../../../../shared/components/search-box/search-box.module";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatMomentDateModule} from "@angular/material-moment-adapter";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatSortModule} from "@angular/material/sort";
import {MatTabsModule} from "@angular/material/tabs";
import {FuseAlertModule} from "../../../../../@fuse/components/alert";
import {MatCheckboxModule} from '@angular/material/checkbox';
import { NgxSpinnerModule } from "ngx-spinner";
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatCardModule} from '@angular/material/card'
import { EvaluationRoutingModule } from './evaluation-routing.module';
import {TranslocoModule} from "@ngneat/transloco";
import {MatDividerModule} from "@angular/material/divider";
import {EvaluationComponent} from "./evaluation.component";
import { ListEvaluationComponent } from './list-evaluation/list-evaluation.component';
import { TemplateEvaluationComponent } from './template-evaluation/template-evaluation.component';
import { ListCollaboratorsComponent } from './list-collaborators/list-collaborators.component';
import { FocuxPanelFilterModule } from 'app/shared/components/focux-panel-filter/focux-panel-filter.module';
import { FocuxContentMainModule } from 'app/shared/components/focux-content-main/focux-content-main.module';
import { PipesModule } from '../assignment-occupation/pipes/pipes.module';


@NgModule({
  declarations: [
    EvaluationComponent,
    ListEvaluationComponent,
    TemplateEvaluationComponent,
    ListCollaboratorsComponent
  ],
  imports: [
    CommonModule,
    FocuxPanelFilterModule,
    FocuxContentMainModule,
    EvaluationRoutingModule,
    CommonModule,
    TranslocoModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatRippleModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    SearchBoxModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatAutocompleteModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    FuseAlertModule,
    FormsModule,
    MatCheckboxModule,
    NgxSpinnerModule,
    MatTooltipModule,
    MatSliderModule,
    MatRadioModule,
    MatDividerModule,
    MatExpansionModule,
    MatCardModule,
    PipesModule,
    MatPaginatorModule,
  ]
})
export class EvaluationModule { }
