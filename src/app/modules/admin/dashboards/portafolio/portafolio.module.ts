import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { portafolioRoutes } from 'app/modules/admin/dashboards/portafolio/portafolio.routing';
import {RequestComponent} from "./request/request.component";
import {RequestListComponent} from "./request/list/request.component";
import { MatStepperModule } from '@angular/material/stepper';
import { MomentModule } from 'ngx-moment';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { FuseAlertModule } from '@fuse/components/alert';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import { MatTableModule } from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {PriorityRequestModule} from "../../../../shared/pipes/priority-request/priority-request.module";
import {MatExpansionModule} from "@angular/material/expansion";
import { ModalFocuxService } from 'app/core/services/modal-focux/modal-focux.service';
import { FocuxPopupModule } from 'app/shared/components/focux-popup/focux-popup.module';
import { FocuxInputAutocompleteModule } from 'app/shared/components/focux-input-autocomplete/focux-input-autocomplete.module';

@NgModule({
    declarations: [
        RequestComponent,
        RequestListComponent,
    ],
    imports: [
        RouterModule.forChild(portafolioRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTooltipModule,
        MatStepperModule,
        MatDatepickerModule,
        SharedModule,
        MomentModule,
        MatMomentDateModule,
        FuseAlertModule,
        MatAutocompleteModule,
        MatTableModule,
        MatProgressSpinnerModule,
        PriorityRequestModule,
        MatExpansionModule,
        FocuxPopupModule,
        FocuxInputAutocompleteModule
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ],
      providers   : [
          ModalFocuxService,
        { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
    ]
})
export class PortafolioModule
{
}
