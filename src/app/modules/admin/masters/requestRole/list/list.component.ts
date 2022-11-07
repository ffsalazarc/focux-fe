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
import { RequestRole } from 'app/modules/admin/masters/requestRole/requestRole.types';
import { RequestRoleService } from '../requestRole.service';
import { FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'requestRole-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestRoleListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    requestRoles$: Observable<RequestRole[]>;
    successSave: String = '';
    activatedAlert: boolean = true;

    requestRoleCount: number = 0;
    requestRoleTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];

    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedRequestRole: RequestRole;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _requestRoleService: RequestRoleService,
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
        // Get the requestRole
        this.requestRoles$ = this._requestRoleService.requestRoles$;

        this._requestRoleService.requestRoles$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((requestRoles: RequestRole[]) => {
                if (this._requestRoleService.activateAlertDelete) {
                    this.activatedAlert = true;
                    this.successSave = 'Registro eliminado con éxito.';
                    this._fuseAlertService.show('alertDeleteRequestRole');
                }
                this.requestRoleCount = requestRoles.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the requestRole
        this._requestRoleService.requestRole$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((requestRole: RequestRole) => {
                // Update the selected requestRole
                this.selectedRequestRole = requestRole;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected requestRole when drawer closed
                this.selectedRequestRole = null;

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
                this.createRequestRole();
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
        this._requestRoleService.activateAlert = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create requestRole
     */
    createRequestRole(): void {
        // Create the requestRole
        this._requestRoleService.updateRequestRoleSelected();
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
        this._requestRoleService.setRequestRoles(event);
      }
}
