import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Department, IndicatorType, Month, OperatorType, Period, Template } from '../evaluation.types';
import { EvaluationService } from '../evaluation.service';
import { Objetive } from '../../../masters/objetives/objetives.types';
import { ObjetivesService } from '../../../masters/objetives/objetives.service';
import { Indicator } from 'app/modules/admin/masters/indicators/indicators.types';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { periods, months, indicatorType, operatorsType, templateList } from '../mock-data/data';

@Component({
  selector: 'app-template-evaluation',
  templateUrl: './template-evaluation.component.html',
  styleUrls: ['./template-evaluation.component.scss']
})
export class TemplateEvaluationComponent implements OnInit {
	private _unsubscribeAll: Subject<any> = new Subject<any>();
	departments$: Observable<Department[]>;
	objetives$: Observable<Objetive[]>;
	indicators$: Observable<Indicator[]>;
	objetivesCount: number = 0;
	templates: any[] = [];
	template: FormGroup;
	collaboratorsPerformace: any[] = [];
	months: Month[];
	periods: Period[];
	templateList: Template[];
	indicatorsType: IndicatorType[];
	operatorsType: OperatorType[];
	period: FormControl;
	templateControl: FormControl;
	periodId: number;
	panelOpenState = false;

	// -----------------------------------------------------------------------------------------------------
	// @ Lifecycle hooks
	// -----------------------------------------------------------------------------------------------------

	constructor(
		private _evaluationService: EvaluationService,
		private _changeDetectorRef: ChangeDetectorRef,
		private _objetivesService: ObjetivesService,
		private _formBuilder: FormBuilder,
	) {
		this.template = this._formBuilder.group({
			evaluations: this._formBuilder.array([])
		});

		this.periods = periods;
		this.months = months;
		this.indicatorsType = indicatorType;
		this.operatorsType = operatorsType;
		this.templateList = templateList;
	}

	/**
	 * On init
	 * 
	 */
	ngOnInit(): void {

		this.departments$ = this._evaluationService.departments$;
		this.objetives$ = this._evaluationService.objetives$;
		this.indicators$ = this._evaluationService.indicators$;

		this._evaluationService.collaboratorSelected$
			.subscribe(collaboratorSelected => {
				// Set collaborator selected
				let aux = collaboratorSelected || [];
				// Update select the periods
				this.period = this._formBuilder.control(this._evaluationService.period);

				this.templateControl = this._formBuilder.control(this._evaluationService.template.id);

				this._setTemplates(aux);


				// Mark for check
				this._changeDetectorRef.markForCheck();
			});
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
				template						: this._evaluationService.template.name,
				evaluations					: this._formBuilder.group({
					evaluationsControls		: this._formBuilder.array([])
				})
			};

			// Loop for each month
			for (let i = 1; i < 4; i++) {
				// Loop for each the template
				for (let j = 0; j < 2; j++) {
					// Add form group for each evaluation the template
					(collaboratorPerformace.evaluations.get('evaluationsControls') as FormArray).push(this._formBuilder.group({
						month            : [i],
						typeIndicator    : [{value: 1, disabled: true}],
						typeObjetive     : [{value: 1, disabled: true}],
						indicator        : [{value: 1, disabled: true}],
						objetive         : [{value: 1, disabled: true}],
						weight           : [{value: 1, disabled: true}],
						result           : [100],
						goal             : [{value: 1, disabled: true}],
						observation      : ['Cargado con exito'],
					}));
				}
			}
			
			// Add new collaborator performance
			this.collaboratorsPerformace.push(collaboratorPerformace);
		});
	}

	newEvaluation(collaborator: any) {
		(collaborator.evaluations.get('evaluationsControls') as FormArray).push(this._formBuilder.group({
			month		     : [''],
			typeIndicator    : [''],
			typeObjetive     : [''],
			indicator        : [''],
			objetive         : [''],
			weight           : [''],
			result           : [''],
			goal             : [''],
			observation      : [''],
		}));
	}

	removeEvaluation(collaborator: any, index: number) {
		(collaborator.evaluations.get('evaluationsControls') as FormArray).removeAt(index);
	}
}
