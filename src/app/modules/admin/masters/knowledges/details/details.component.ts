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
    CreatevKnowledge,
    Knowledge,
} from 'app/modules/admin/masters/knowledges/knowledges.types';
import { KnowledgesListComponent } from 'app/modules/admin/masters/knowledges/list/list.component';
import { KnowledgesService } from 'app/modules/admin/masters/knowledges/knowledges.service';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'knowledges-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgesDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('knowledgesPanel') private _knowledgesPanel: TemplateRef<any>;
    @ViewChild('knowledgesPanelOrigin')
    private _knowledgesPanelOrigin: ElementRef;

    successSave: String = '';
    activatedAlert: boolean = false;
    editMode: boolean = false;

    knowledgesEditMode: boolean = false;
    isCreate: boolean = false;

    knowledge: Knowledge;
    knowledgeForm: FormGroup;
    knowledges: Knowledge[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _knowledgesPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _knowledgesListComponent: KnowledgesListComponent,
        private _knowledgesService: KnowledgesService,
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
        this._knowledgesListComponent.matDrawer.open();

        if (this._knowledgesService.activateAlert) {
            this.activatedAlert = true;
            this.successSave = 'Registro creado con éxito.';
            this._fuseAlertService.show('alertBoxKnowledge');
        }

        // Create the knowledge form
        this.knowledgeForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            type: ['', [Validators.required]],
            isActive: [''],
        });

        // Get the knowledges
        this._knowledgesService.knowledges$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((knowledges: Knowledge[]) => {
                this.knowledges = knowledges;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the knowledge
        this._knowledgesService.knowledge$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((knowledge: Knowledge) => {
                // Open the drawer in case it is closed
                this._knowledgesListComponent.matDrawer.open();

                // Get the knowledge
                this.knowledge = knowledge;

                if (this.knowledge) {
                    // Patch values to the form
                    this.knowledgeForm.patchValue(knowledge);

                    this.knowledgeForm.get('type').setValue(knowledge.type);

                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.isCreate = true;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if (!this.knowledge) {
            this.editMode = true;
            this._knowledgesListComponent.matDrawer.open();
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
        return this._knowledgesListComponent.matDrawer.close();
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
        this._knowledgesService.activateAlertDelete = false;
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

    createKnowledge(): void {
        this.knowledgeForm.removeControl('id', { emitEvent: false });
        let newKnowledge: CreatevKnowledge = this.knowledgeForm.getRawValue();
        newKnowledge.isActive = 1;

        this._knowledgesService
            .createKnowledge(newKnowledge)
            .subscribe((knowledge: Knowledge) => {
                // Toggle the edit mode off
                this.toggleEditMode(false);
                this.activatedAlert = true;
                const id = knowledge.id;
                this._router.navigate(['../', id], {
                    relativeTo: this._activatedRoute,
                });
            });
    }

    /**
     * Update the knowledge
     */
    updateKnowledge(): void {
        // Get the knowledge object
        let knowledge = this.knowledgeForm.getRawValue();

        // Update the knowledge on the server
        this._knowledgesService
            .updateKnowledge(knowledge.id, knowledge)
            .subscribe(() => {
                // Toggle the edit mode off
                this.toggleEditMode(false);
                this.activatedAlert = true;
                this.successSave = 'Registro editado con éxito.';
                this._fuseAlertService.show('alertBoxKnowledge');
            });
    }

    /**
     * Delete the knowledge
     */
    deleteKnowledge(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Borrar conocimiento',
            message:
                '\n' +
                '¿Estás seguro de que deseas eliminar este Conocimiento? ¡Esta acción no se puede deshacer!',
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
                // Get the current knowledge's id
                const id = this.knowledge.id;

                // Get the next/previous knowledge's id
                const currentKnowledgeIndex = this.knowledges.findIndex(
                    (item) => item.id === id
                );
                let nextKnowledgeId = null;
                if (currentKnowledgeIndex == this.knowledges.length - 1) {
                    for (let i = currentKnowledgeIndex - 1; i >= 0; i--) {
                        if (this.knowledges[i].isActive != 0) {
                            nextKnowledgeId = this.knowledges[i].id;
                        }
                    }
                } else {
                    for (
                        let i = currentKnowledgeIndex + 1;
                        i < this.knowledges.length;
                        i++
                    ) {
                        if (this.knowledges[i].isActive != 0) {
                            nextKnowledgeId = this.knowledges[i].id;
                        }
                    }
                }

                // Delete the knowledge
                this.knowledge.isActive = 0;
                this._knowledgesService
                    .deleteKnowledge(this.knowledge)
                    .subscribe(() => {
                        // Navigate to the next knowledge if available

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
            this.knowledgeForm.controls[field].errors &&
            this.knowledgeForm.controls[field].touched
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
