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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import {
    Client,
    BusinessType,
} from 'app/modules/admin/masters/clients/clients.types';
import { ClientsListComponent } from 'app/modules/admin/masters/clients/list/list.component';
import { ClientsService } from 'app/modules/admin/masters/clients/clients.service';
import { FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'clients-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('knowledgesPanel') private _knowledgesPanel: TemplateRef<any>;
    @ViewChild('knowledgesPanelOrigin')
    private _knowledgesPanelOrigin: ElementRef;

    successSave: String = '';
    activatedAlert: boolean = false;
    editMode: boolean = false;
    isCreate: boolean = false;

    knowledgesEditMode: boolean = false;

    client: Client;
    clientForm: FormGroup;
    clients: Client[];
    businessTypes: BusinessType[];
    filteredBusinessTypes: BusinessType[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _knowledgesPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _clientsListComponent: ClientsListComponent,
        private _clientsService: ClientsService,
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
        this._clientsListComponent.matDrawer.open();

        if (this._clientsService.activateAlert) {
            this.activatedAlert = true;
            this.successSave = 'Registro creado con éxito.';
            this._fuseAlertService.show('alertBoxClient');
        }

        // Create the client form
        this.clientForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            isActive: [''],
            businessType: [, [Validators.required]],
        });

        // Get the clients
        this._clientsService.clients$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((clients: Client[]) => {
                this.clients = clients;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the client
        this._clientsService.client$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((client: Client) => {
                // Open the drawer in case it is closed
                this._clientsListComponent.matDrawer.open();

                // Get the client
                this.client = client;

                if (this.client) {
                    // Patch values to the form
                    this.clientForm.patchValue(client);

                    this.clientForm
                        .get('businessType')
                        .setValue(client.businessType.id);

                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.isCreate = true;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the client

        this._clientsService.businessTypes$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((businessType: BusinessType[]) => {
                this.businessTypes = businessType;
                this.filteredBusinessTypes = businessType;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if (!this.client) {
            this.editMode = true;
            this._clientsListComponent.matDrawer.open();
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
        return this._clientsListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        this._clientsService.activateAlertDelete = false;
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
     * Create the client
     */
    createClient(): void {
        this.clientForm.removeControl('id', { emitEvent: false });
        let newClient = this.clientForm.getRawValue();
        newClient.businessType = this.businessTypes.find(
            (value) => value.id == newClient.businessType
        );
        newClient.isActive = 1;

        this._clientsService
            .createClient(newClient)
            .subscribe((client: Client) => {
                // Toggle the edit mode off
                this.toggleEditMode(false);
                this.activatedAlert = true;
                const id = client.id;
                this._router.navigate(['../', id], {
                    relativeTo: this._activatedRoute,
                });
            });
    }

    /**
     * Update the client
     */
    updateClient(): void {
        // Get the client object
        let client = this.clientForm.getRawValue();
        client.businessType = this.businessTypes.find(
            (value) => value.id == client.businessType
        );
        // Update the client on the server
        this._clientsService.updateClient(client.id, client).subscribe(() => {
            // Toggle the edit mode off
            this.toggleEditMode(false);
            this.activatedAlert = true;
            this.successSave = 'Registro editado con éxito.';
            this._fuseAlertService.show('alertBoxClient');
        });
    }

    filterPositionsByBusinessType() {
        let businessTypeSelected = this.clientForm.get('businessType').value;

        this.businessTypes = this.businessTypes.filter(
            (elem) => elem.id === businessTypeSelected
        );
    }

    /**
     * Delete the client
     */
    deleteClient(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Borrar Cliente',
            message:
                '\n' +
                '¿Estás seguro de que deseas eliminar este cliente? ¡Esta acción no se puede deshacer!',
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
                // Get the current client's id
                const id = this.client.id;

                // Get the next/previous client's id
                const currentClientIndex = this.clients.findIndex(
                    (item) => item.id === id
                );
                let nextClientId = null;
                if (currentClientIndex == this.clients.length - 1) {
                    for (let i = currentClientIndex - 1; i >= 0; i--) {
                        if (this.clients[i].isActive != 0) {
                            nextClientId = this.clients[i].id;
                        }
                    }
                } else {
                    for (
                        let i = currentClientIndex + 1;
                        i < this.clients.length;
                        i++
                    ) {
                        if (this.clients[i].isActive != 0) {
                            nextClientId = this.clients[i].id;
                        }
                    }
                }

                // Delete the client
                this.client.isActive = 0;
                this._clientsService.deleteClient(this.client).subscribe(() => {
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
            this.clientForm.controls[field].errors &&
            this.clientForm.controls[field].touched
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
