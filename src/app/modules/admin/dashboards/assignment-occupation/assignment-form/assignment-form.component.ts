import { Component, OnInit, EventEmitter, Input, Output, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import {
	Collaborator,
	Project,
	AssignationOccupation,
	RolesRequest,
} from '../assignment-occupation.types';
import { AssingmentOccupationService } from '../assingment-occupation.service';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { forkJoin, Observable, pipe, Subject } from 'rxjs';
import { Console } from 'console';
import { ModalFocuxService } from 'app/core/services/modal-focux/modal-focux.service';

@Component({
	selector: 'app-assignment-form',
	templateUrl: './assignment-form.component.html',
	styleUrls: ['./assignment-form.component.scss']
})
export class AssignmentFormComponent implements OnInit {

	@Input('formOcupation') formOcupation: FormGroup;
	@Input('edit') edit: boolean;
	@Input('collaboratorInfo') collaboratorInfo: Collaborator;
	@ViewChild('requestDetailsTemplate') private tplDetail: TemplateRef<any>;
	private _unsubscribeAll: Subject<any> = new Subject<any>();
	request: Object = {};
	collaboratorsArr: any[] = [];
	rolesRequest$: Observable<RolesRequest[]>;
	
	// -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

	constructor(
		private _assignmentOccupationService: AssingmentOccupationService,
		private _changeDetectorRef: ChangeDetectorRef,
		private _modalFocuxService: ModalFocuxService
	) { }

	ngOnInit(): void {

		this.rolesRequest$ =
			this._assignmentOccupationService.rolesRequest$.pipe(
				takeUntil(this._unsubscribeAll)
			);

		this.rolesRequest$.subscribe(response => {
		})

		this._assignmentOccupationService.collaboratorSelected$
			.pipe(map((collaboratorSelected) => collaboratorSelected))
			.subscribe((collaboratorSelected) => {
				// Set collaborator selected
				let aux = collaboratorSelected || [];

				this.collaboratorsArr = [...aux];

				this._changeDetectorRef.markForCheck();
			});

	}

	// -----------------------------------------------------------------------------------------------------
	// @ Accessors
	// -----------------------------------------------------------------------------------------------------

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

			return (Number(collaboratorAssignation.occupation) + Number(this.collaboratorsArr[collaboratorIndex]));
		}

		return 100;
	}

	/**
	 * Open popup
	 *
	 */
	public _openPopup(data: any) {
		let actionOption;

		this.request = data;

		actionOption = 'detail-leader-request';

		this._modalFocuxService.open({
			template: this.tplDetail, title: actionOption,
		},
			{ width: 300, height: 2880, disableClose: true, panelClass: 'summary-panel' }).subscribe(confirm => {
				if (confirm) {
					this._changeDetectorRef.markForCheck();
				}
			});
	}


}
