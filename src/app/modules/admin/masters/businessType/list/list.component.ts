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
import { BusinessType } from 'app/modules/admin/masters/businessType/businessTypes.types';
import { BusinessTypesService } from '../businessTypes.service';
import { FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'businessTypes-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessTypesListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    businessTypes$: Observable<BusinessType[]>;
    successSave: String = '';
    activatedAlert: boolean = true;

    businessTypesCount: number = 0;
    businessTypesTableColumns: string[] = [
        'name',
        'email',
        'phoneNumber',
        'job',
    ];

    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedBusinessType: BusinessType;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _businessTypesService: BusinessTypesService,
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
        // Get the businessTypes
        this.businessTypes$ = this._businessTypesService.businessTypes$;

        this._businessTypesService.businessTypes$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((businessTypes: BusinessType[]) => {
                if (this._businessTypesService.activateAlertDelete) {
                    this.activatedAlert = true;
                    this.successSave = 'Registro eliminado con éxito.';
                    this._fuseAlertService.show('alertDeleteBusinessType');
                }
                this.businessTypesCount = businessTypes.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the businessType
        this._businessTypesService.businessType$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((businessType: BusinessType) => {
                // Update the selected businessType
                this.selectedBusinessType = businessType;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected businessType when drawer closed
                this.selectedBusinessType = null;

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
                this.createBusinessType();
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
        this._businessTypesService.activateAlert = false;

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create business Type
     */
    createBusinessType(): void {
        // Create the businessType
        this._businessTypesService.updateBusinessTypeSelected();
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
        this._businessTypesService.setBusinessType(event);
      }
}
