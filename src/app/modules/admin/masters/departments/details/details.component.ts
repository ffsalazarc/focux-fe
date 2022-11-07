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
    CreateDepartment,
    Department,
} from 'app/modules/admin/masters/departments/departments.types';
import { DepartmentsListComponent } from 'app/modules/admin/masters/departments/list/list.component';
import { DepartmentsService } from 'app/modules/admin/masters/departments/departments.service';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'departments-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentsDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('knowledgesPanel') private _knowledgesPanel: TemplateRef<any>;
    @ViewChild('knowledgesPanelOrigin')
    private _knowledgesPanelOrigin: ElementRef;

    successSave: String = '';
    activatedAlert: boolean = false;
    editMode: boolean = false;

    knowledgesEditMode: boolean = false;
    isCreate: boolean = false;

    department: Department;
    departmentForm: FormGroup;
    departments: Department[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _knowledgesPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _departmentsListComponent: DepartmentsListComponent,
        private _departmentsService: DepartmentsService,
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
        this._departmentsListComponent.matDrawer.open();

        if (this._departmentsService.activateAlert) {
            this.activatedAlert = true;
            this.successSave = 'Registro creado con éxito.';
            this._fuseAlertService.show('alertBoxDepartment');
        }

        // Create the department form
        this.departmentForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            code: ['', [Validators.required]],
            isActive: [''],
        });

        // Get the departments
        this._departmentsService.departments$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((departments: Department[]) => {
                this.departments = departments;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the department
        this._departmentsService.department$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((department: Department) => {
                // Open the drawer in case it is closed
                this._departmentsListComponent.matDrawer.open();

                // Get the department
                this.department = department;

                if (this.department) {
                    // Patch values to the form
                    this.departmentForm.patchValue(department);

                    this.departmentForm.get('code').setValue(department.code);

                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.isCreate = true;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if (!this.department) {
            this.editMode = true;
            this._departmentsListComponent.matDrawer.open();
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
        return this._departmentsListComponent.matDrawer.close();
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
        this._departmentsService.activateAlertDelete = false;
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
     * Create the department
     */
    createDepartment(): void {
        this.departmentForm.removeControl('id', {
            emitEvent: false,
        });
        let newDepartment: CreateDepartment = this.departmentForm.getRawValue();
        newDepartment.isActive = 1;

        this._departmentsService
            .createDepartment(newDepartment)
            .subscribe((departament: Department) => {
                // Toggle the edit mode off
                this.toggleEditMode(false);
                this.activatedAlert = true;
                const id = departament.id;
                this._router.navigate(['../', id], {
                    relativeTo: this._activatedRoute,
                });
            });
    }

    /**
     * Update the department
     */
    updateDepartment(): void {
        // Get the department object
        let department = this.departmentForm.getRawValue();

        // Update the department on the server
        this._departmentsService
            .updateDepartment(department.id, department)
            .subscribe(() => {
                // Toggle the edit mode off
                this.toggleEditMode(false);
                this.activatedAlert = true;
                this.successSave = 'Registro editado con éxito.';
                this._fuseAlertService.show('alertBoxDepartment');
            });
    }

    /**
     * Delete the department
     */
    deleteDepartment(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Borrar Departamento',
            message:
                '\n' +
                '¿Estás seguro de que deseas eliminar este departmento? ¡Esta acción no se puede deshacer!',
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
                // Get the current department's id
                const id = this.department.id;

                // Get the next/previous department's id
                const currentDepartmentIndex = this.departments.findIndex(
                    (item) => item.id === id
                );
                let nextDepartmentId = null;
                if (currentDepartmentIndex == this.departments.length - 1) {
                    for (let i = currentDepartmentIndex - 1; i >= 0; i--) {
                        if (this.departments[i].isActive != 0) {
                            nextDepartmentId = this.departments[i].id;
                        }
                    }
                } else {
                    for (
                        let i = currentDepartmentIndex + 1;
                        i < this.departments.length;
                        i++
                    ) {
                        if (this.departments[i].isActive != 0) {
                            nextDepartmentId = this.departments[i].id;
                        }
                    }
                }

                // Delete the department
                this.department.isActive = 0;
                this._departmentsService
                    .deleteDepartment(this.department)
                    .subscribe(() => {
                        // Navigate to the next department if available

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
            this.departmentForm.controls[field].errors &&
            this.departmentForm.controls[field].touched
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
