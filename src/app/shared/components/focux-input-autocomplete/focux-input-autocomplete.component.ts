import { Component, OnInit, ChangeDetectorRef, ViewChild, EventEmitter, Output, Input, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { Observable, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Client, Collaborator } from 'app/modules/admin/dashboards/collaborators/collaborators.types';
import { BusinessType } from '../../../modules/admin/dashboards/portafolio/request/request.types';

@Component({
  selector: 'app-focux-input-autocomplete',
  templateUrl: './focux-input-autocomplete.component.html',
  styleUrls: ['./focux-input-autocomplete.component.scss']
})
export class FocuxInputAutocompleteComponent implements OnInit {

    @ViewChild(MatSort) private _sort: MatSort;
    @Output('filterCollaborators') filterCollaborators: EventEmitter<any> = new EventEmitter<any>();
    @Input('items') businessTypeSelected: any[];
    @Input('label') label: string;
    @Input('optionInput') optionInput :string;
    filterGroupForm: FormGroup;
    allCompleteBusinessType: boolean = false;
    commercialAreaSelected = [];
    statusSelected = [];
    isActive: boolean = true;
    selectedItem: any = null;
    allCompleteClient: boolean = false;
    allCompleteCommercialArea: boolean = false;
    allCompleteStatus: boolean = false;
    activatedAlert: boolean = false;
    filteredStatus: Observable<string[]>;
    lastFilter: string = '';
    clientSelected = [];
    clients: Client[];
    filteredClients: Observable<string[]>;
    filteredCommercialArea: Observable<string[]>;
    filteredCustomerBranch: any = [];
    businessType: BusinessType[];
    leaders: Collaborator[];

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    constructor(
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        ) {

            // Create the fiterGroupForm
            this.filterGroupForm = this._formBuilder.group({
                clientControl: [],
                commercialAreaControl: [],
                statusControl: [],
                customerBranchControl: [],
            });
        }

    ngOnInit(): void {
        this.customerBranchControl.valueChanges.pipe(
                startWith(''),
                map((value) => (typeof value === 'string' ? value : this.lastFilter)),
                map((filter) => this.filter(filter, this.businessTypeSelected)))
                    .subscribe(response => {
                        this.filteredCustomerBranch = response;
                        this._changeDetectorRef.markForCheck();
                    });
    }

    ngOnChanges(changes: SimpleChanges) {
        if ( changes?.businessTypeSelected && changes?.businessTypeSelected.currentValue.length > 0 ) {
            this.customerBranchControl.setValue('');
        }

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for statusCotrol
     */
    get statusControl() {
        return this.filterGroupForm.get('statusControl');
    }


    /**
     * Getter for clientControl
     */
    get clientControl() {
        return this.filterGroupForm.get('clientControl');
    }

    /**
     * Getter for clientControl
     */
    get commercialAreaControl() {
        return this.filterGroupForm.get('commercialAreaControl');
    }

    /**
     * Getter for customerBranchControl
     */
    get customerBranchControl() {
        return this.filterGroupForm.get('customerBranchControl');
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

     /**
     * Some complete
     *
     * @returns
     */
    someComplete(collection: any, allComplete: boolean): boolean {
        return collection ? collection.filter(item => item.selected).length > 0 && !allComplete : false;
    }

    /**
     * Set all as selected
     *
     * @param completed
     */
    setAll(completed: boolean, collection: any, option: string) {
        // Mark as completed all elements
        collection.forEach(item => item.selected = completed);

        this.allCompleteBusinessType = completed;

        this.filterCollaborators.emit(collection);

        this.handleChangeCheckbox(option)
    }

    /**
     * Update all complete
     *
     * @param option
     */
    updateAllComplete(option: string) {
        this.allCompleteBusinessType = this.businessTypeSelected != null && this.businessTypeSelected.every(item => item.selected);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Handle change the checkbox
     *
     * @param option
     */
    handleChangeCheckbox(option: string) {
        this.customerBranchControl.setValue('');
    }

    /**
     * Filter
     *
     * @param filter
     * @param collection
     * @returns
     */
    filter(filter: string, collection: any[]): any[] {
        this.lastFilter = filter;
        if (filter) {
            return collection.filter((option) => {
                return (option.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0);
            });
        } else {
            return collection.slice();
        }
    }

    /**
     * Toggle Selection
     *
     * @param selectedFilter
     * @param collection
     */
    toggleSelection(selectedFilter: any, selectedCollection: BusinessType[] | Client[], option: string) {
        // change status the selected

        const collectionIndex = this.businessTypeSelected?.findIndex(item => item.id === selectedFilter.id);

        if ( collectionIndex >= 0) {
            this.businessTypeSelected[collectionIndex].selected = !this.businessTypeSelected[collectionIndex].selected;
        }
        // update all as complete
        this.updateAllComplete(option);
        // Handle change from checkbox
        this.handleChangeCheckbox(option);

        this.filterCollaborators.emit(this.businessTypeSelected);

       
        this._changeDetectorRef.markForCheck();

    }

    /**
     * Update selected item
     *
     * @param selectedItem
     */
    updateSelectedItem(selectedItem: any) {
        if (this.selectedItem) {
            this.selectedItem = null;
        } else {
            this.selectedItem = selectedItem;
        }
    }

    /**
     * Restarting list
     *
     * @param control
     */
    restartingList(control: FormControl) {
        control.setValue('', { emitEvent: false });
        control.updateValueAndValidity({ onlySelf: true, emitEvent: true });
    }

    /**
     * Select only one item
     *
     * @param selectedItem
     */
    selectOnlyItem(selectedItem: any, collection: any) {
        selectedItem.selected = true;

        collection.forEach((item) => {
            if (item.name !== selectedItem.name) {
                item.selected = false;
            }
        });
    }

}
