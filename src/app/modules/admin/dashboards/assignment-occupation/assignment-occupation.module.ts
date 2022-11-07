import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatRippleModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { FuseAlertModule } from '../../../../../@fuse/components/alert';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';

import { AssignmentOccupationRouter } from './assignment-occupation.routing';
import { SearchBoxModule } from '../../../../shared/components/search-box/search-box.module';
import { FilterCollaboratorPipe } from './pipes/filter-collaborator.pipe';
import { DetailAssignmentComponent } from './detail-assignment/detail-assignment.component';
import { PanelFilterModule } from 'app/shared/components/panel-filter/panel-filter.module';
import { ContentMainModule } from 'app/shared/components/content-main/content-main.module';
import { AssignmentCollaboratorComponent } from './detail-assignment/assignment-collaborator/assignment-collaborator.component';
import { AssignmentFormComponent } from './assignment-form/assignment-form.component';
import { FocuxPopupModule } from 'app/shared/components/focux-popup/focux-popup.module';
import { FocusPopupRequestComponent } from './detail-assignment/focux-popup-request/focus-popup-request.component';
import { EditAssignmentComponent } from './edit-assignment/edit-assignment.component';
import { UpdateOccupationComponent } from './edit-assignment/update-occupation/update-occupation.component';
import { ListCollaboratorsComponent } from './detail-assignment/list-collaborators/list-collaborators.component';
import { AssignmentOccupationComponent } from './assignment-occupation.component';
import { PartnerSearchComponent } from './partner-search/partner-search.component';
import { AsignationComponent } from './asignation/asignation.component';
import { FocuxInputAutocompleteModule } from 'app/shared/components/focux-input-autocomplete/focux-input-autocomplete.module';
import { FocuxPanelFilterModule } from 'app/shared/components/focux-panel-filter/focux-panel-filter.module';
import { FocuxContentMainModule } from 'app/shared/components/focux-content-main/focux-content-main.module';
import { PipesModule } from './pipes/pipes.module';

@NgModule({
    declarations: [
        AssignmentOccupationComponent,
        PartnerSearchComponent,
        AsignationComponent,
        FilterCollaboratorPipe,
        EditAssignmentComponent,
        UpdateOccupationComponent,
        ListCollaboratorsComponent,
        DetailAssignmentComponent,
        ListCollaboratorsComponent,
        AssignmentCollaboratorComponent,
        AssignmentFormComponent,
        FocusPopupRequestComponent,
    ],
    imports: [
        CommonModule,
        TranslocoModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatRippleModule,
        MatProgressBarModule,
        RouterModule.forChild(AssignmentOccupationRouter),
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
        PanelFilterModule,
        FocuxPanelFilterModule,
        FocuxContentMainModule,
        ContentMainModule,
        MatExpansionModule,
        FocuxPopupModule,
        FocuxInputAutocompleteModule,
        //Pipes module
        PipesModule,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
        {
            provide: MAT_DATE_LOCALE,
            useValue: 'es-ES',
        },
    ],
})
export class AssignmentOccupationModule {}
