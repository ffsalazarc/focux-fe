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
import { Department } from 'app/modules/admin/masters/departments/departments.types';
import { DepartmentsService } from '../departments.service';
import { AuthService } from 'app/core/auth/auth.service';
import { FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'departments-list',
    templateUrl: './list.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentsListComponent implements OnInit, OnDestroy {
    @ViewChild('matDrawer', { static: true }) matDrawer: MatDrawer;

    departments$: Observable<Department[]>;
    successSave: String = '';
    activatedAlert: boolean = true;

    departmentsCount: number = 0;
    departmentsTableColumns: string[] = ['name', 'email', 'phoneNumber', 'job'];

    drawerMode: 'side' | 'over';
    searchInputControl: FormControl = new FormControl();
    selectedDepartment: Department;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _departmentsService: DepartmentsService,
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
        // Get the departments
        this.departments$ = this._departmentsService.departments$;

        this._departmentsService.departments$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((departments: Department[]) => {
                if (this._departmentsService.activateAlertDelete) {
                    this.activatedAlert = true;
                    this.successSave = 'Registro eliminado con éxito.';
                    this._fuseAlertService.show('alertDeleteDepartment');
                }
                this.departmentsCount = departments.length;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the department
        this._departmentsService.department$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((department: Department) => {
                // Update the selected department
                this.selectedDepartment = department;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Subscribe to MatDrawer opened change
        this.matDrawer.openedChange.subscribe((opened) => {
            if (!opened) {
                // Remove the selected department when drawer closed
                this.selectedDepartment = null;

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
                this.createDepartment();
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
        this._departmentsService.activateAlert = false;
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create department
     */
    createDepartment(): void {
        // Create the department
        this._departmentsService.updateDepartmentSelected();
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
        this._departmentsService.setDepartments(event);
      }
}
