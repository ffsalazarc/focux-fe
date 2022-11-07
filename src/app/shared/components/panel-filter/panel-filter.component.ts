import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, AbstractControl } from '@angular/forms';
import {MatSlider} from '@angular/material/slider';
@Component({
  selector: 'app-panel-filter',
  templateUrl: './panel-filter.component.html',
  styleUrls: ['./panel-filter.component.scss']
})
export class PanelFilterComponent implements OnInit, AfterViewInit {

	@Input('clients') clients: any[];
	@Input('knowledges') knowledges: any[];
	@Input('openPanelClient') openPanelClient?: boolean;
	@Input('openPanelKnowledges') openPanelKnowledges?: boolean;
	@Input('occupationState') occupationState?: number;
	@Output('changeFilter') changeFilter: EventEmitter<any> = new EventEmitter<any>();
	@Input('initialState') initialState?: any[];

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

	ngOnInit(): void {
		this._setFilterClients();
		this._setFilterKnowledges();
		this.filterCollaboratorsGroup.valueChanges
            .subscribe((values) => {
                // Get collaborator by filter
                this._getCollaboratorsByFilter();
        });

           
	}

	ngAfterViewInit(){
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

        const filteredClients = filterClients.filter(
            (item) => item.checked && item.id
        );
        const clientsId = filteredClients.map(
            (item) => item.id
        );
        const filteredKnowledges = filterKnowledges.filter(
            (item) => item.checked && item.id
        );
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
		// Create form array filterClients
		const clientId = (this.initialState.length > 0 && this.initialState[0].length) > 0 ? this.initialState[0]:[];
		this.clients.forEach(client => {

		const checkedClient = clientId.find((item) => item == client.id);

		this.filterClients.push(
			this._formBuilder.group({
				id: [client.id],
				name: [client.name],
				checked: [checkedClient >= 0 ? true: false],
			}),
					{ emitEvent: false }
		);


			
		})
	
		// Mark as check
		this._changeDetectorRef.markForCheck();
	}

	/**
	 * Set filter knowledges
	 * 
	 */
	private _setFilterKnowledges() {
		// Create form array filterClients
		const knowledgeId = (this.initialState.length > 0 && this.initialState[1].length) > 0 ? this.initialState[1]:[];

		this.knowledges.forEach(knowledge => {
			
		    const checkedKnowledges = knowledgeId.find((item) => item == knowledge.id);
				this.filterKnowledges.push(
				this._formBuilder.group({
					id: [knowledge.id],
					name: [knowledge.name],
					checked: [checkedKnowledges >= 0 ? true : false],
				}),
				{ emitEvent: false }
			);	
			})
			
	

		// Mark as check
		this._changeDetectorRef.markForCheck();
	}
	/**
	 * Set filter 
	 * 
	 */

}
