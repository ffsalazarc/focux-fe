import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    OnChanges,
    SimpleChanges,
    DoCheck,
} from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { AssingmentOccupationService } from '../../assingment-occupation.service';

@Component({
    selector: 'app-list-collaborators',
    templateUrl: './list-collaborators.component.html',
    styleUrls: ['./list-collaborators.component.scss'],
})
export class ListCollaboratorsComponent implements OnInit, OnChanges {
    @Input('collaborators') collaborators;
    @Input('filterCollaboratorForm') filterCollaboratorForm: FormGroup;
    @Input('allSelected') allSelected?: boolean = false;
    @Output('handleEventClick') handleEventClick: EventEmitter<any> =
        new EventEmitter<any>();

    collaboratorArrayForm: FormGroup;
    hasCheckedCollaborator: boolean;
    selectedAll: boolean = false;
    collabSelect: boolean = false;

    page_size: number = 10;
    page_number: number = 1;
    pageSizeOptions = [10, 20, 50, 100];
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    constructor(
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _assingmentOccupationService: AssingmentOccupationService
    ) {}

    ngOnInit(): void {
        
        this.collaboratorArrayForm = new FormGroup({
            collaboratorSelected: new FormArray([]),
        });

        this._setFormArrayCollaborators();
       
        this.hasCheckedCollaborator =
            this._assingmentOccupationService.collaboratorsSelectedTwo.length >
            0
                ? true
                : false;

        this.selectedAll = this._assingmentOccupationService.allCollaborators;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.collaborators && !changes.collaborators.firstChange) {
            this._setFormArrayCollaborators();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * collaboratorSelected
     *
     */
    get collaboratorSelected() {
        return this.collaboratorArrayForm.get(
            'collaboratorSelected'
        ) as FormArray;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Handle event checkbox
     *
     * @param collaborator
     */
    handleEventCheckbox(collaborator) {
        // find if collaborator already selected
        const collaboratorIndex =
            this._assingmentOccupationService.collaboratorsSelectedTwo.findIndex(
                (item) => item.id === collaborator.id
            );

        collaboratorIndex >= 0
            ? this._assingmentOccupationService.collaboratorsSelectedTwo.splice(
                  collaboratorIndex,
                  1
              )
            : this._assingmentOccupationService.collaboratorsSelectedTwo.push(
                  collaborator
              );

        this.hasCheckedCollaborator =
            this._assingmentOccupationService.collaboratorsSelectedTwo.length >
            0
                ? true
                : false;
    }

    /**
     *  Set form array the collaborators
     *
     */
    private _setFormArrayCollaborators() {
       
        // Clear formArray
        this.collaboratorSelected.clear();
        // Set formArray
        this.collaborators.forEach((item) => {
            // Create form group of collaborator

            const collaboratorIndex =
                this._assingmentOccupationService.collaboratorsSelectedTwo.findIndex(
                    (collaboratorSelected) =>
                        item.id === collaboratorSelected.id
                );

            const collaboratorGroup = this._formBuilder.group({
                id: [item.id],
                checked: [collaboratorIndex >= 0 ? true : false],
            });

            this.collaboratorSelected.push(collaboratorGroup);
            // value.collaboratorSelected[i] = this.collaborators[i];
        });

        this.hasCheckedCollaborator =
            this._assingmentOccupationService.collaboratorsSelectedTwo.length >
            0
                ? true
                : false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    handleEventCheckboxAll() {
        this.collaboratorSelected.clear();
        this.selectedAll = !this.selectedAll;
        this.hasCheckedCollaborator = this.selectedAll;
        this._assingmentOccupationService.collaboratorsSelectedTwo = [];
        this.collaborators.forEach((item, index) => {
            const collaboratorGroup = this._formBuilder.group({
                id: [item.id],
                checked: [this.selectedAll],
            });

            this.collaboratorSelected.push(collaboratorGroup);

            this.selectedAll
                ? this._assingmentOccupationService.collaboratorsSelectedTwo.push(
                      item
                  )
                : this._assingmentOccupationService.collaboratorsSelectedTwo.splice(
                      index,
                      1
                  );
            this._assingmentOccupationService.allCollaborators =
                this.selectedAll;
        });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    handlePage(e: PageEvent) {
        this.page_size = e.pageSize;
        this.page_number = e.pageIndex + 1;
    }
}
