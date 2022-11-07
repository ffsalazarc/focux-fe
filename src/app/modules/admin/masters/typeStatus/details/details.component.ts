import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TypeStatu} from 'app/modules/admin/masters/typeStatus/typeStatus.types';
import { TypeStatusListComponent } from 'app/modules/admin/masters/typeStatus/list/list.component';
import { TypeStatusService } from 'app/modules/admin/masters/typeStatus/typeStatus.service';

@Component({
    selector       : 'typeStatus-details',
    templateUrl    : './details.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TypeStatusDetailsComponent implements OnInit, OnDestroy
{
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('knowledgesPanel') private _knowledgesPanel: TemplateRef<any>;
    @ViewChild('knowledgesPanelOrigin') private _knowledgesPanelOrigin: ElementRef;

    editMode: boolean = false;

    knowledgesEditMode: boolean = false;

    typeStatu: TypeStatu;
    typeStatuForm: FormGroup;
    typeStatus: TypeStatu[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _knowledgesPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _typeStatusListComponent: TypeStatusListComponent,
        private _typeStatusService: TypeStatusService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Open the drawer
        this._typeStatusListComponent.matDrawer.open();

        // Create the typeStatu form
        this.typeStatuForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            code:['', [Validators.required]],
            isActive: ['']

        })

        // Get the typeStatus
        this._typeStatusService.typeStatus$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((typeStatus: TypeStatu[]) => {
                this.typeStatus = typeStatus;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the typeStatu
        this._typeStatusService.typeStatu$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((typeStatu: TypeStatu) => {


               


                // Open the drawer in case it is closed
                this._typeStatusListComponent.matDrawer.open();

                // Get the typeStatu
                this.typeStatu = typeStatu;




                // Patch values to the form
                this.typeStatuForm.patchValue(typeStatu);

                this.typeStatuForm.get('code').setValue(typeStatu.code);

                // Toggle the edit mode off
                this.toggleEditMode(false);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });



        if(this.typeStatu.name === 'Nuevo tipo de estatus'){
            this.editMode = true;
        }

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        // Dispose the overlays if they are still on the DOM
        if ( this._knowledgesPanelOverlayRef )
        {
            this._knowledgesPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult>
    {
        return this._typeStatusListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void
    {
       

        if ( editMode === null )
        {
            this.editMode = !this.editMode;
        }
        else
        {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Update the typeStatu
     */
    updateTypeStatu(): void
    {
        // Get the typeStatu object
        let typeStatu = this.typeStatuForm.getRawValue();

        // Update the typeStatu on the server
       
        this._typeStatusService.updateTypeStatu(typeStatu.id, typeStatu).subscribe(() => {

            // Toggle the edit mode off
            this.toggleEditMode(false);
        });
    }



    /**
     * Delete the typeStatu
     */
    deleteTypeStatu(): void
    {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title  : 'Borrar Departamento',
            message: '\n' +
                '¿Estás seguro de que deseas eliminar este typeStatuo? ¡Esta acción no se puede deshacer!',
            actions: {
                confirm: {
                    label: 'Borrar'
                }
            }
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {

            // If the confirm button pressed...
            if ( result === 'confirmed' )
            {
                // Get the current typeStatu's id
                const id = this.typeStatu.id;

                // Get the next/previous typeStatu's id
                const currentTypeStatuIndex = this.typeStatus.findIndex(item => item.id === id);
                let nextTypeStatuId = null;
                if (currentTypeStatuIndex == (this.typeStatus.length - 1)) {
                    for (let i = currentTypeStatuIndex - 1; i >= 0; i--) {
                        if (this.typeStatus[i].isActive != 0) {
                            nextTypeStatuId = this.typeStatus[i].id;
                        }
                    }
                } else {
                    for (let i = currentTypeStatuIndex + 1; i < this.typeStatus.length; i++) {
                        if (this.typeStatus[i].isActive != 0) {
                            nextTypeStatuId = this.typeStatus[i].id;
                        }
                    }
                }


                // Delete the typeStatu
                this.typeStatu.isActive = 0;
                this._typeStatusService.deleteTypeStatu(this.typeStatu)
                    .subscribe(() => {
                        // Navigate to the next typeStatu if available


                            this._router.navigate(['../'], {relativeTo: this._activatedRoute});


                        // Toggle the edit mode off
                        this.toggleEditMode(false);
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

    }

    isNotValid(field: string): boolean{
        return this.typeStatuForm.controls[field].errors && this.typeStatuForm.controls[field].touched;
    }
}
