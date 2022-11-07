import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    Validators,
    FormControl,
} from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import {
    EmployeePosition,
    Department,
} from 'app/modules/admin/masters/employeePosition/employeePosition.types';
import { EmployeePositionListComponent } from 'app/modules/admin/masters/employeePosition/list/list.component';
import { EmployeePositionsService } from 'app/modules/admin/masters/employeePosition/employeePosition.service';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'employeePositions-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeePositionDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('knowledgesPanel') private _knowledgesPanel: TemplateRef<any>;
    @ViewChild('knowledgesPanelOrigin')
    private _knowledgesPanelOrigin: ElementRef;

    editMode: boolean = false;
    isCreate: boolean = false;
    successSave: String = '';
    activatedAlert: boolean = false;

    knowledgesEditMode: boolean = false;

    employeePosition: EmployeePosition;
    employeePositionForm: FormGroup;
    employeePositions: EmployeePosition[];
    departments: Department[];
    filteredDepartments: Department[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _knowledgesPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _employeePositionsListComponent: EmployeePositionListComponent,
        private _employeePositionsService: EmployeePositionsService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private _authService: AuthService,
        private _fuseAlertService: FuseAlertService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._employeePositionsListComponent.matDrawer.open();

        if (this._employeePositionsService.activateAlert) {
            this.activatedAlert = true;
            this.successSave = 'Registro creado con éxito.';
            this._fuseAlertService.show('alertBoxEmployeePosition');
        }

        // Create the employeePosition form
        this.employeePositionForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            isActive: [''],
            department: [, [Validators.required]],
        });

        // Get the employeePositions
        this._employeePositionsService.employeePositions$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((employeePositions: EmployeePosition[]) => {
                this.employeePositions = employeePositions;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the employeePosition
        this._employeePositionsService.employeePosition$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((employeePosition: EmployeePosition) => {
                // Open the drawer in case it is closed
                this._employeePositionsListComponent.matDrawer.open();

                // Get the employeePosition
                this.employeePosition = employeePosition;

                if (this.employeePosition) {
                    // Patch values to the form
                    this.employeePositionForm.patchValue(employeePosition);

                    this.employeePositionForm
                        .get('department')
                        .setValue(employeePosition.department.id);

                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.isCreate = true;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the employeePosition

        this._employeePositionsService.departments$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((department: Department[]) => {
                this.departments = department;
                this.filteredDepartments = department;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if (!this.employeePosition) {
            this.editMode = true;
            this._employeePositionsListComponent.matDrawer.open();
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        // Dispose the overlays if they are still on the DOM
        if (this._knowledgesPanelOverlayRef) {
            this._knowledgesPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._employeePositionsListComponent.matDrawer.close();
    }

    /**
     * Check if the role is ROLE_BASIC
     */
    canEdit(): boolean {
        return !(this._authService.role === 'ROLE_BASIC');
    }
    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        this._employeePositionsService.activateAlertDelete = false;
        if (editMode === null) {
            this.editMode = !this.editMode;
        } else {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    returnToListView(): void {
        this._router.navigate(['../'], {
            relativeTo: this._activatedRoute,
        });
    }

    /**
     * Create the EmployeePosition
     */
    createEmployeePosition(): void {
        this.employeePositionForm.removeControl('id', { emitEvent: false });
        let newEmployeePosition = this.employeePositionForm.getRawValue();
        newEmployeePosition.department = this.departments.find(
            (value) => value.id == newEmployeePosition.department
        );
        newEmployeePosition.isActive = 1;

        this._employeePositionsService
            .createEmployeePosition(newEmployeePosition)
            .subscribe((employeePosition: EmployeePosition) => {
                // Toggle the edit mode off
                this.toggleEditMode(false);
                this.activatedAlert = true;
                const id = employeePosition.id;
                this._router.navigate(['../', id], {
                    relativeTo: this._activatedRoute,
                });
            });
    }

    /**
     * Update the employeePosition
     */
    updateEmployeePosition(): void {
        // Get the employeePosition object
        let employeePosition = this.employeePositionForm.getRawValue();
        employeePosition.department = this.departments.find(
            (value) => value.id == employeePosition.department
        );
        // Update the employeePosition on the server
        this._employeePositionsService
            .updateEmployeePosition(employeePosition.id, employeePosition)
            .subscribe(() => {
                // Toggle the edit mode off
                this.toggleEditMode(false);
                this.activatedAlert = true;
                this.successSave = 'Registro editado con éxito.';
                this._fuseAlertService.show('alertBoxEmployeePosition');
            });
    }

    filterPositionsByDepartment() {
        let departmentSelected =
            this.employeePositionForm.get('department').value;

        this.departments = this.departments.filter(
            (elem) => elem.id === departmentSelected
        );
    }

    /**
     * Delete the employeePosition
     */
    deleteEmployeePosition(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Borrar Cargo',
            message:
                '\n' +
                '¿Estás seguro de que deseas eliminar este Cargo? ¡Esta acción no se puede deshacer!',
            actions: {
                confirm: {
                    label: 'Borrar',
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Get the current employeePosition's id
                const id = this.employeePosition.id;

                // Get the next/previous employeePosition's id
                const currentEmployeePositionIndex =
                    this.employeePositions.findIndex((item) => item.id === id);
                let nextEmployeePositionId = null;
                if (
                    currentEmployeePositionIndex ==
                    this.employeePositions.length - 1
                ) {
                    for (
                        let i = currentEmployeePositionIndex - 1;
                        i >= 0;
                        i--
                    ) {
                        if (this.employeePositions[i].isActive != 0) {
                            nextEmployeePositionId =
                                this.employeePositions[i].id;
                        }
                    }
                } else {
                    for (
                        let i = currentEmployeePositionIndex + 1;
                        i < this.employeePositions.length;
                        i++
                    ) {
                        if (this.employeePositions[i].isActive != 0) {
                            nextEmployeePositionId =
                                this.employeePositions[i].id;
                        }
                    }
                }

                // Delete the employeePosition
                this.employeePosition.isActive = 0;
                this._employeePositionsService
                    .deleteEmployeePosition(this.employeePosition)
                    .subscribe(() => {
                        // Navigate to the next employeePosition if available

                        this._router.navigate(['../'], {
                            relativeTo: this._activatedRoute,
                        });

                        // Toggle the edit mode off
                        this.toggleEditMode(false);
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    isNotValid(field: string): boolean {
        return (
            this.employeePositionForm.controls[field].errors &&
            this.employeePositionForm.controls[field].touched
        );
    }

    /**
     *
     * @param name
     */
    dismissFuse(name) {
        this._fuseAlertService.dismiss(name);
    }
}
