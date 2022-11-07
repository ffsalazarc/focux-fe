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
    CreateRequestRole,
    RequestRole,
} from 'app/modules/admin/masters/requestRole/requestRole.types';
import { RequestRoleListComponent } from 'app/modules/admin/masters/requestRole/list/list.component';
import { RequestRoleService } from 'app/modules/admin/masters/requestRole/requestRole.service';
import { FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'requestRoles-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestRoleDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('knowledgesPanel') private _knowledgesPanel: TemplateRef<any>;
    @ViewChild('knowledgesPanelOrigin')
    private _knowledgesPanelOrigin: ElementRef;

    editMode: boolean = false;
    successSave: String = '';
    activatedAlert: boolean = false;

    knowledgesEditMode: boolean = false;
    isCreate: boolean = false;

    requestRole: RequestRole;
    requestRoleForm: FormGroup;
    requestRoles: RequestRole[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _knowledgesPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _requestRoleListComponent: RequestRoleListComponent,
        private _requestRoleService: RequestRoleService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
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
        this._requestRoleListComponent.matDrawer.open();
        if (this._requestRoleService.activateAlert) {
            this.activatedAlert = true;
            this.successSave = 'Registro creado con éxito.';
            this._fuseAlertService.show('alertBoxRequestRole');
        }

        // Create the requestRole form
        this.requestRoleForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            code: [''],
            isActive: [''],
        });

        // Get the requestRoles
        this._requestRoleService.requestRoles$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((requestRoles: RequestRole[]) => {
                this.requestRoles = requestRoles;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the requestRole
        this._requestRoleService.requestRole$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((requestRole: RequestRole) => {
                // Open the drawer in case it is closed
                this._requestRoleListComponent.matDrawer.open();

                // Get the requestRole
                this.requestRole = requestRole;

                if (this.requestRole) {
                    // Patch values to the form
                    this.requestRoleForm.patchValue(requestRole);

                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.isCreate = true;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if (!this.requestRole) {
            this.editMode = true;
            this._requestRoleListComponent.matDrawer.open();
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
        return this._requestRoleListComponent.matDrawer.close();
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        this._requestRoleService.activateAlertDelete = false;
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
     * Create the requestRole
     */
    createRequestRole(): void {
        this.requestRoleForm.removeControl('id', { emitEvent: false });
        this.requestRoleForm.removeControl('code', { emitEvent: false });
        let newRequestRole: CreateRequestRole =
            this.requestRoleForm.getRawValue();
        newRequestRole.isActive = 1;

        this._requestRoleService
            .createRequestRole(newRequestRole)
            .subscribe((requestRole: RequestRole) => {
                // Toggle the edit mode off
                this.toggleEditMode(false);
                this.activatedAlert = true;
                const id = requestRole.id;
                this._router.navigate(['../', id], {
                    relativeTo: this._activatedRoute,
                });
            });
    }

    /**
     * Update the requestRole
     */
    updateRequestRole(): void {
        // Get the requestRole object
        const requestRole = this.requestRoleForm.getRawValue();

        // Update the requestRole on the server
        this._requestRoleService
            .updateRequestRole(requestRole.id, requestRole)
            .subscribe(() => {
                // Toggle the edit mode off
                this.toggleEditMode(false);
                this.activatedAlert = true;
                this.successSave = 'Registro editado con éxito.';
                this._fuseAlertService.show('alertBoxRequestRole');
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Delete the requestRole
     */
    deleteRequestRole(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Borrar Departamento',
            message:
                '\n' +
                '¿Estás seguro de que deseas eliminar este requestRoleo? ¡Esta acción no se puede deshacer!',
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
                // Get the current requestRole's id
                const id = this.requestRole.id;

                // Get the next/previous requestRole's id
                const currentRequestRoleIndex = this.requestRoles.findIndex(
                    (item) => item.id === id
                );
                let nextRequestRoleId = null;
                if (currentRequestRoleIndex == this.requestRoles.length - 1) {
                    for (let i = currentRequestRoleIndex - 1; i >= 0; i--) {
                        if (this.requestRoles[i].isActive != 0) {
                            nextRequestRoleId = this.requestRoles[i].id;
                        }
                    }
                } else {
                    for (
                        let i = currentRequestRoleIndex + 1;
                        i < this.requestRoles.length;
                        i++
                    ) {
                        if (this.requestRoles[i].isActive != 0) {
                            nextRequestRoleId = this.requestRoles[i].id;
                        }
                    }
                }

                // Delete the requestRole
                this.requestRole.isActive = 0;
                this._requestRoleService
                    .deleteRequestRole(this.requestRole)
                    .subscribe(() => {
                        // Navigate to the next requestRole if available

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
            this.requestRoleForm.controls[field].errors &&
            this.requestRoleForm.controls[field].touched
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
