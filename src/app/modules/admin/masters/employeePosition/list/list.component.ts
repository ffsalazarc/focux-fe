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
import { EmployeePosition } from 'app/modules/admin/masters/employeePosition/employeePosition.types';
import { EmployeePositionsService } from '../employeePosition.service';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'employeePositions-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeePositionListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    employeePositions$: Observable<EmployeePosition[]>;
    successSave: String = '';
    activatedAlert: boolean = true;

    employeePositionsCount: number = 0;
    employeePositionsTableColumns: string[] = [
        'name',
        'email',
        'phoneNumber',
        'job',
    ];

    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedEmployeePosition: EmployeePosition;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _employeePositionsService: EmployeePositionsService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
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
        // Get the employeePositions
        this.employeePositions$ =
            this._employeePositionsService.employeePositions$;

        this._employeePositionsService.employeePositions$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((employeePositions: EmployeePosition[]) => {
                if (this._employeePositionsService.activateAlertDelete) {
                    this.activatedAlert = true;
                    this.successSave = 'Registro eliminado con éxito.';
                    this._fuseAlertService.show('alertDeleteEmployeePosition');
                }
                this.employeePositionsCount = employeePositions.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the employeePosition
        this._employeePositionsService.employeePosition$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((employeePosition: EmployeePosition) => {
                // Update the selected employeePosition
                this.selectedEmployeePosition = employeePosition;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected employeePosition when drawer closed
                this.selectedEmployeePosition = null;

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
                this.createEmployeePosition();
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
     * Check if the role is ROLE_BASIC
     */
    canEdit(): boolean {
        return !(this._authService.role === 'ROLE_BASIC');
    }
    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Go back to the list
        this._router.navigate(['./'], { relativeTo: this._activatedRoute });
        this._employeePositionsService.activateAlert = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create employeePosition
     */
    createEmployeePosition(): void {
        // Create the employeePosition
        this._employeePositionsService.updateEmployeePositionSelected();
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
        this._employeePositionsService.setEmployeePosition(event);
      }

}
