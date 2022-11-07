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
import { TechnicalArea } from 'app/modules/admin/masters/technicalAreas/technicalAreas.types';
import { TechnicalAreasListComponent } from 'app/modules/admin/masters/technicalAreas/list/list.component';
import { TechnicalAreasService } from 'app/modules/admin/masters/technicalAreas/technicalAreas.service';
import { FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'technicalAreas-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnicalAreasDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('knowledgesPanel') private _knowledgesPanel: TemplateRef<any>;
    @ViewChild('knowledgesPanelOrigin')
    private _knowledgesPanelOrigin: ElementRef;

    editMode: boolean = false;
    isCreate: boolean = false;
    successSave: String = '';
    activatedAlert: boolean = false;

    knowledgesEditMode: boolean = false;

    technicalArea: TechnicalArea;
    technicalAreaForm: FormGroup;
    technicalAreas: TechnicalArea[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _knowledgesPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _technicalAreasListComponent: TechnicalAreasListComponent,
        private _technicalAreasService: TechnicalAreasService,
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
        this._technicalAreasListComponent.matDrawer.open();

        if (this._technicalAreasService.activateAlert) {
            this.activatedAlert = true;
            this.successSave = 'Registro creado con éxito.';
            this._fuseAlertService.show('alertBoxTechnicalArea');
        }

        // Create the technicalArea form
        this.technicalAreaForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            code: ['', [Validators.required]],
            isActive: [''],
        });

        // Get the technicalAreas
        this._technicalAreasService.technicalAreas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((technicalAreas: TechnicalArea[]) => {
                this.technicalAreas = technicalAreas;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the technicalArea
        this._technicalAreasService.technicalArea$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((technicalArea: TechnicalArea) => {
                // Open the drawer in case it is closed
                this._technicalAreasListComponent.matDrawer.open();

                // Get the technicalArea
                this.technicalArea = technicalArea;

                if (this.technicalArea) {
                    // Patch values to the form
                    this.technicalAreaForm.patchValue(technicalArea);

                    this.technicalAreaForm
                        .get('code')
                        .setValue(technicalArea.code);

                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.isCreate = true;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if (!this.technicalArea) {
            this.editMode = true;
            this._technicalAreasListComponent.matDrawer.open();
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
        return this._technicalAreasListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        this._technicalAreasService.activateAlertDelete = false;
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
     * Create the technicalArea
     */
    createTechnicalArea(): void {
        this.technicalAreaForm.removeControl('id', { emitEvent: false });
        let newTechnicalArea = this.technicalAreaForm.getRawValue();
        newTechnicalArea.isActive = 1;

        this._technicalAreasService
            .createTechnicalArea(newTechnicalArea)
            .subscribe((technicalArea: TechnicalArea) => {
                // Toggle the edit mode off
                this.toggleEditMode(false);
                this.activatedAlert = true;
                const id = technicalArea.id;
                this._router.navigate(['../', id], {
                    relativeTo: this._activatedRoute,
                });
            });
    }

    /**
     * Update the technicalArea
     */
    updateTechnicalArea(): void {
        // Get the technicalArea object
        let technicalArea = this.technicalAreaForm.getRawValue();

        // Update the technicalArea on the server
        this._technicalAreasService
            .updateTechnicalArea(technicalArea.id, technicalArea)
            .subscribe(() => {
                // Toggle the edit mode off
                this.toggleEditMode(false);
                this.activatedAlert = true;
                this.successSave = 'Registro editado con éxito.';
                this._fuseAlertService.show('alertBoxTechnicalArea');
            });
    }

    /**
     * Delete the technicalArea
     */
    deleteTechnicalArea(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Borrar &Aacute;rea T&eacute;cnica',
            message:
                '\n' +
                '¿Estás seguro de que deseas eliminar esta área técnica? ¡Esta acción no se puede deshacer!',
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
                // Get the current technicalArea's id
                const id = this.technicalArea.id;

                // Get the next/previous technicalArea's id
                const currentTechnicalAreaIndex = this.technicalAreas.findIndex(
                    (item) => item.id === id
                );
                let nextTechnicalAreaId = null;
                if (
                    currentTechnicalAreaIndex ==
                    this.technicalAreas.length - 1
                ) {
                    for (let i = currentTechnicalAreaIndex - 1; i >= 0; i--) {
                        if (this.technicalAreas[i].isActive != 0) {
                            nextTechnicalAreaId = this.technicalAreas[i].id;
                        }
                    }
                } else {
                    for (
                        let i = currentTechnicalAreaIndex + 1;
                        i < this.technicalAreas.length;
                        i++
                    ) {
                        if (this.technicalAreas[i].isActive != 0) {
                            nextTechnicalAreaId = this.technicalAreas[i].id;
                        }
                    }
                }

                // Delete the technicalArea
                this.technicalArea.isActive = 0;
                this._technicalAreasService
                    .deleteTechnicalArea(this.technicalArea)
                    .subscribe(() => {
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
            this.technicalAreaForm.controls[field].errors &&
            this.technicalAreaForm.controls[field].touched
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
