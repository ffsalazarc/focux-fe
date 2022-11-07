import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { fromEvent, Observable, Subject } from 'rxjs';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { Client } from 'app/modules/admin/masters/clients/clients.types';
import { ClientsService } from '../clients.service';
import { FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'clients-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientsListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    clients$: Observable<Client[]>;
    successSave: String = '';
    activatedAlert: boolean = true;

    clientsCount: number = 0;
    clientsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];

    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedClient: Client;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _clientsService: ClientsService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseAlertService: FuseAlertService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the clients
        this.clients$ = this._clientsService.clients$;

        this._clientsService.clients$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((clients: Client[]) => {
                if (this._clientsService.activateAlertDelete) {
                    this.activatedAlert = true;
                    this.successSave = 'Registro eliminado con éxito.';
                    this._fuseAlertService.show('alertDeleteClient');
                }
                this.clientsCount = clients.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        // Get the client
        this._clientsService.client$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((client: Client) => {
                // Update the selected client
                this.selectedClient = client;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });



        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected client when drawer closed
                this.selectedClient = null;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Set the drawerMode if the given breakpoint is active
                if (matchingAliases.includes('lg')) {
                    this.drawerMode = 'side';
                } else {
                    this.drawerMode = 'over';
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Listen for shortcuts
        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>(
                    (event) =>
                        (event.ctrlKey === true || event.metaKey) && // Ctrl or Cmd
                        event.key === '/' // '/'
                )
            )
            .subscribe(() => {
                this.createClient();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._clientsService.activateAlert = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create client
     */
    createClient(): void {
        // Create the client
        this._clientsService.updateClientSelected();
        this._router.navigate(['./create'], {
            relativeTo: this._activatedRoute,
        });
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    handleSearch(event){
        this._clientsService.setClients(event);
      }
}
