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
import { TypeRequest } from 'app/modules/admin/masters/typeRequest/typeRequest.types';
import { TypeRequestService } from '../typeRequest.service';
import { FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'typeRequest-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeRequestListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    typeRequests$: Observable<TypeRequest[]>;
    successSave: String = '';
    activatedAlert: boolean = true;

    typeRequestCount: number = 0;
    typeRequestTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];

    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedTypeRequest: TypeRequest;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _typeRequestService: TypeRequestService,
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
        // Get the typeRequest
        this.typeRequests$ = this._typeRequestService.typeRequests$;

        this._typeRequestService.typeRequests$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((typeRequests: TypeRequest[]) => {
                if (this._typeRequestService.activateAlertDelete) {
                    this.activatedAlert = true;
                    this.successSave = 'Registro eliminado con éxito.';
                    this._fuseAlertService.show('alertDeleteTypeRequest');
                }
                this.typeRequestCount = typeRequests.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the typeRequest
        this._typeRequestService.typeRequest$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((typeRequest: TypeRequest) => {
                // Update the selected typeRequest
                this.selectedTypeRequest = typeRequest;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected typeRequest when drawer closed
                this.selectedTypeRequest = null;

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
                this.createTypeRequest();
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
        this._typeRequestService.activateAlert = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create typeRequest
     */
    createTypeRequest(): void {
        // Create the typeRequest
        this._typeRequestService.updateTypeRequestSelected();
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
        this._typeRequestService.setTypeRequests(event);
      }
}
