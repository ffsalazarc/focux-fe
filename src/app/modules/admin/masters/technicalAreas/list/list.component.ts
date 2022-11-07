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
import { TechnicalArea } from 'app/modules/admin/masters/technicalAreas/technicalAreas.types';
import { TechnicalAreasService } from '../technicalAreas.service';
import { FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'technicalAreas-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TechnicalAreasListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    technicalAreas$: Observable<TechnicalArea[]>;
    successSave: String = '';
    activatedAlert: boolean = true;
    technicalAreasCount: number = 0;
    technicalAreasTableColumns: string[] = [
        'name',
        'email',
        'phoneNumber',
        'job',
    ];

    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedTechnicalArea: TechnicalArea;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _technicalAreasService: TechnicalAreasService,
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
        // Get the technicalAreas
        this.technicalAreas$ = this._technicalAreasService.technicalAreas$;

        this._technicalAreasService.technicalAreas$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((technicalAreas: TechnicalArea[]) => {
                if (this._technicalAreasService.activateAlertDelete) {
                    this.activatedAlert = true;
                    this.successSave = 'Registro eliminado con éxito.';
                    this._fuseAlertService.show('alertDeleteTechnicalArea');
                }
                this.technicalAreasCount = technicalAreas.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the technicalArea
        this._technicalAreasService.technicalArea$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((technicalArea: TechnicalArea) => {
                // Update the selected technicalArea
                this.selectedTechnicalArea = technicalArea;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected technicalArea when drawer closed
                this.selectedTechnicalArea = null;

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
                this.createTechnicalArea();
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
        this._technicalAreasService.activateAlert = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create technicalArea
     */
    createTechnicalArea(): void {
        // Create the Technical Area
        this._technicalAreasService.updateTechnicalAreaSelected();
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
        this._technicalAreasService.setTechnicalAreas(event);
      }
}
