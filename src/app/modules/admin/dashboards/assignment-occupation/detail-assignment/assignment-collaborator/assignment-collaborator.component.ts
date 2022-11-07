import { ChangeDetectorRef, Component, Input, OnInit, Output, EventEmitter, OnDestroy, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { Client, Collaborator,  Knowledge, Department } from '../../../assignment-occupation/assignment-occupation.types';
import { Objetive } from '../../../../masters/objetives/objetives.types';
import { Indicator } from '../../../../masters/indicators/indicators.types';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { FormArray, FormBuilder, FormControl, FormGroup,
  Validators, } from '@angular/forms';
import { ObjetivesService } from '../../../../masters/objetives/objetives.service';
import { EvaluationService } from '../../../evaluation/evaluation.service';
import {AssingmentOccupationService} from "../../assingment-occupation.service";
import { DateValidator } from '../../../assignment-occupation/asignation/date-validation';
import { limitOccupation } from '../../partner-search/limit-occupation';
import { ModalFocuxService } from 'app/core/services/modal-focux/modal-focux.service';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-assignment-collaborator',
  templateUrl: './assignment-collaborator.component.html',
  styleUrls: ['./assignment-collaborator.component.scss']
})
export class AssignmentCollaboratorComponent implements OnInit, AfterViewInit {

	@ViewChild(MatAccordion) _accordion: MatAccordion;
	@Output('goBack') goBack: EventEmitter<any> = new EventEmitter();
	
	private _unsubscribeAll: Subject<any> = new Subject<any>();
	
	template: FormGroup;
	collaboratorsPerformace: any[] = [];
	  formOcupation: FormGroup = this._formBuilder.group({
	    collaboratorOccupation: this._formBuilder.array([]),
	});

	@ViewChild('requestDetailsTemplate') private tplDetail: TemplateRef<any>;
	collaboratorsArr: any[] = [];
	panelOpenState = false;
	collaboratorsSelected: any = [];

	// -----------------------------------------------------------------------------------------------------
	// @ Lifecycle hooks
	// -----------------------------------------------------------------------------------------------------

	constructor(
		private _assingmentOccupationService: AssingmentOccupationService,
		private _changeDetectorRef: ChangeDetectorRef,
		private _formBuilder: FormBuilder,
		private _modalFocuxService  : ModalFocuxService
	) {
		this.template = this._formBuilder.group({
			evaluations: this._formBuilder.array([])
		});
	}

	/**
	 * On init
	 * 
	 */
	ngOnInit(): void {
		this._assingmentOccupationService.collaboratorSelectedTwo$
			.subscribe(collaboratorSelected => {
				// Set collaborator selected
				let aux = collaboratorSelected || [];
				this.collaboratorsSelected = aux;
				// Update select the periods

				this._setTemplates(aux);

				// Mark for check
				this._changeDetectorRef.markForCheck();
			});
	}

	/**
	 * After view init
	 * 
	 */
	ngAfterViewInit(): void {
		this._accordion.openAll();
		this._changeDetectorRef.detectChanges();
	}

	/**
	 * On destroy
	 * 
	 */
	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Accessors
	// -----------------------------------------------------------------------------------------------------

	get evaluations() {
		return this.template.get('evaluations') as FormArray;
	}

  	/**
     * Get collaborator occupation
     *
     */
   	get collaboratorOccupation() {
    	return this.formOcupation.get('collaboratorOccupation') as FormArray;
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	private _setTemplates(selectedCollaborators: any[]) {
		this.collaboratorsPerformace = [];

		selectedCollaborators.forEach(collaborator => {
			// Create new collaborator performance

			let collaboratorPerformace: any = {
				name						: collaborator.name,
				lastName					: collaborator.lastName,
				client						: collaborator.client.name,
				percentageOccupation		: collaborator.occupationPercentage,
				assignmentForm				: this._formBuilder.group({
					collaboratorOccupation	: this._formBuilder.array([])
				})
			};

			collaborator.assigments.forEach((item) => {
				if ( item ) {
					let collaboratorOccupation: FormGroup = this._formBuilder.group({
							id: [item.id],
							name: [item.request, Validators.required],
							occupation: [item.occupationPercentage, [Validators.required, Validators.maxLength(100), limitOccupation(item.occupationPercentage),],],
							observation: [item.observations],
							dateInit: [item.assignmentStartDate, Validators.required],
							dateEnd: [item.assignmentEndDate, Validators.required],
							roleRequest: [{value:item.roleId, disabled : true}, Validators.required],
							isCollapse: [false],
							},
							{ validator: DateValidator }
						);

					// Initial default value
					collaboratorOccupation.get('id').setValue(item.id);
					// Add collaboratorOcupation to formOcupation
					(collaboratorPerformace.assignmentForm.get('collaboratorOccupation') as FormArray).push(collaboratorOccupation);
					
				}
			});

			// Add new collaborator performance
			this.collaboratorsPerformace.push(collaboratorPerformace);
		});
	}

	 /**
     * Get calculate real percentage
     *
     * @param collaboratorAssignation
     * @returns
     */
	  calculatePercentageReal(collaboratorAssignation) {
        const collaboratorIndex = this.collaboratorsArr.findIndex(
            (item) => item && item.id === collaboratorAssignation.id
        );

        if (collaboratorAssignation) {
            return (
                Number(collaboratorAssignation.occupation) +
                Number(
                    this.collaboratorsArr[collaboratorIndex]
                        .occupationPercentage
                )
            );
        }
    }

}
