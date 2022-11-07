import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges} from '@angular/core';
import { FormGroup, FormArray, FormBuilder, AbstractControl } from '@angular/forms';
import {MatSlider} from '@angular/material/slider';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-focux-panel-filter',
  templateUrl: './focux-panel-filter.component.html',
  styleUrls: ['./focux-panel-filter.component.scss']
})
export class FocuxPanelFilterComponent implements OnInit, OnChanges {

  	@Input('clients') clients: any[];
	@Input('knowledges') knowledges: any[];
	@Input('openPanelClient') openPanelClient?: boolean = false;
	@Input('openPanelKnowledges') openPanelKnowledges?: boolean = false;
	@Input('occupationState') occupationState?: number = 0;
	@Output('changeFilter') changeFilter: EventEmitter<any> = new EventEmitter<any>();
	@Input('initialState') initialState?: any[] = [];
	// @Input('initialState') set initialState(values) {
	// 	console.log("entroooo");
	// 	//this._setFilterClients();
	// 	//this._setFilterKnowledges();
	// } 

	selectedFilterClient: boolean = false;
	selectedFilterKnowledge: boolean = false;
	selectedFilterOccupation: boolean = false;
	filterCollaboratorsGroup: FormGroup;
	range: FormGroup;
	@ViewChild(MatSlider) slider: MatSlider; 
  
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

	constructor(
		private _formBuilder: FormBuilder,
		private _changeDetectorRef: ChangeDetectorRef,
	) {
		// Create form group for filter collaborators
        this.filterCollaboratorsGroup = this._formBuilder.group({
            filterClients			: this._formBuilder.array([]),
            filterKnowledges		: this._formBuilder.array([]),
            filterOccupation		: [0],
            filterDateInit			: [''],
            filterDateEnd			: [''],
        });

		this.range = this._formBuilder.group({
			start	: [],
			end		: [],
		});
	}

	/**
	 * On int
	 */
	ngOnInit(): void {
		this._setFilterClients();
		this._setFilterKnowledges();
		this.filterCollaboratorsGroup.valueChanges
			.pipe(debounceTime(500))
				.subscribe((values) => {
					// Get collaborator by filter
					this._getCollaboratorsByFilter();
			});       
	}

	/**
	 * On Changes
	 * @param changes 
	 */
	ngOnChanges(changes: SimpleChanges): void {
        if ( changes.initialState && !changes.initialState.firstChange ) {
			this._setFilterClients();
		}
    }

	/**
	 * After View init
	 */
	ngAfterViewInit(): void {
		this.filterOccupation.setValue(this.occupationState);
		this._changeDetectorRef.detectChanges();
		//this.slider.value = this.occupationState;
	}

	// -----------------------------------------------------------------------------------------------------
	// @ Accessors
	// -----------------------------------------------------------------------------------------------------

	/**
     * Filter clients
     * 
     */
	 get filterClients() {
        return this.filterCollaboratorsGroup.get('filterClients') as FormArray;
    }

    /**
     * Filter knowledges
     * 
     */
    get filterKnowledges(): FormArray {
        return this.filterCollaboratorsGroup.get('filterKnowledges') as FormArray;
    }

    /**
     * Filter occupations
     * 
     */
    get filterOccupation(): AbstractControl {
        return this.filterCollaboratorsGroup.get('filterOccupation');
    }

	// -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

	/**
     * Get collaborators by filter
     * 
     */
    private _getCollaboratorsByFilter() {
        const {
            filterClients,
            filterKnowledges,
            filterOccupation,
            filterDateInit,
            filterDateEnd
        } = this.filterCollaboratorsGroup.getRawValue();

        const filteredClients = filterClients.filter((item) => item.checked && item.id);
        const clientsId = filteredClients.map((item) => item.id);
        const filteredKnowledges = filterKnowledges.filter((item) => item.checked && item.id);
        const knowledgesId = filteredKnowledges.map((item) => item.id);

		this.changeFilter.emit([
			clientsId,
			knowledgesId,
			filterOccupation,
			filterDateInit,
			filterDateEnd,
		]);
    }

	/**
	 * Set filter clients
	 * 
	 */
	private _setFilterClients() {

		this.filterClients.clear({emitEvent: false});

		// Create form array filterClients
		const clientId = (this.initialState && this.initialState?.length > 0 && this.initialState[0].length) > 0 ? this.initialState[0] : [];
		
		this.clients.forEach(client => {
			const checkedClient = clientId.find((item) => item == client.id);

			this.filterClients.push(
				this._formBuilder.group({
					id		: [client.id],
					name	: [client.name],
					checked	: [checkedClient >= 0 ? true: false],
				}),
				{ emitEvent	: true }
			);

			//this.filterClients.updateValueAndValidity({emitEvent: true});
		})
		
		this._setFilterKnowledges();
		// Mark as check
		//this._changeDetectorRef.markForCheck();
	}

	/**
	 * Set filter knowledges
	 * 
	 */
	private _setFilterKnowledges() {
		// Create form array filterClients
		const knowledgeId = (this.initialState && this.initialState?.length > 0 && this.initialState[1].length) > 0 ? this.initialState[1]:[];

		this.filterKnowledges.clear({emitEvent: false});
		this.knowledges.forEach(knowledge => {
		    const checkedKnowledges = knowledgeId.find((item) => item == knowledge.id);

			this.filterKnowledges.push(
			this._formBuilder.group({
				id		: [knowledge.id],
				name	: [knowledge.name],
				checked	: [checkedKnowledges >= 0 ? true : false],
			}),
			{ emitEvent	: true });
		})
		//this.filterKnowledges.updateValueAndValidity({emitEvent: true});

		// Mark as check
		//this._changeDetectorRef.markForCheck();
	}

}