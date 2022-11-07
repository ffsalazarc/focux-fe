import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import {
    CreateDepartment,
    Department,
} from 'app/modules/admin/masters/departments/departments.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class DepartmentsService {
    // Private
    private _activateAlert: boolean = false;
    private _activateAlertDelete: boolean = false;
    private _department: BehaviorSubject<Department | null> =
        new BehaviorSubject(null);
    private _departments: BehaviorSubject<Department[] | null> =
        new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for activateAlert
     */
    get activateAlert() {
        return this._activateAlert;
    }

    /**
     * Getter for activateAlertDelete
     */
    get activateAlertDelete() {
        return this._activateAlertDelete;
    }

    /**
     * Getter for department
     */
    get department$(): Observable<Department> {
        return this._department.asObservable();
    }

    /**
     * Getter for departments
     */
    get departments$(): Observable<Department[]> {
        return this._departments.asObservable();
    }


  setDepartments(department: Department[]) {
    this._departments.next(department);
}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    set activateAlertDelete(option: boolean) {
        this._activateAlertDelete = option;
    }

    set activateAlert(option: boolean) {
        this._activateAlert = option;
    }

    /**
     * Get departments
     */
    getDepartments(): Observable<Department[]> {
        return this._httpClient
            .get<Department[]>(
                `${environment.baseApiUrl}/api/v1/followup/departments/all`,
            )
            .pipe(
                tap((departments) => {
                    let departmentFiltered: any[] = [];

                    function compare(a: Department, b: Department) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;

                        return 0;
                    }
                    departments.sort(compare);
                    departments.forEach((department) => {
                        if (department.isActive != 0) {
                            departmentFiltered.push(department);
                        }
                    });
                    this._departments.next(departmentFiltered);
                })
            );
    }
    /**
     * Get department by id
     */
    getDepartmentById(id: number): Observable<Department> {
        return this._departments.pipe(
            take(1),
            map((departments) => {
                // Find the department¿

                const department =
                    departments.find((item) => item.id === id) || null;

                // Update the department
                this._department.next(department);

                // Return the department

                return department;
            }),
            switchMap((department) => {
                if (!department) {
                    return throwError('El colaborador no existe !');
                }

                return of(department);
            })
        );
    }

    /**
     * Update status selected
     *
     */
    updateDepartmentSelected() {
        return this._department.next(null);
    }

    /**
     * Create department
     */
    createDepartment(newDepartment: CreateDepartment): Observable<Department> {
        // Generate a new department
        return this.departments$.pipe(
            take(1),
            switchMap((departments) =>
                this._httpClient
                    .post<Department>(
                        `${environment.baseApiUrl}/api/v1/followup/departments/save`,
                        newDepartment,
                    )
                    .pipe(
                        map((newDepartment) => {
                            // Update the departments with the new department
                            this.activateAlert = true;
                            this._departments.next([
                                newDepartment,
                                ...departments,
                            ]);

                            // Return the new department
                            return newDepartment;
                        })
                    )
            )
        );
    }

    /**
     * Update department
     *
     * @param id
     * @param department
     */
    updateDepartment(
        id: number,
        department: Department
    ): Observable<Department> {
        return this.departments$.pipe(
            take(1),
            switchMap((departments) =>
                this._httpClient
                    .put<Department>(
                        `${environment.baseApiUrl}/api/v1/followup/departments/department/` +
                            department.id,
                        department,
                    )
                    .pipe(
                        map((updatedDepartment) => {
                            // Find the index of the updated department
                            const index = departments.findIndex(
                                (item) => item.id === id
                            );

                            // Update the department
                            departments[index] = updatedDepartment;

                            function compare(a: Department, b: Department) {
                                if (a.name < b.name) return -1;
                                if (a.name > b.name) return 1;

                                return 0;
                            }
                            departments.sort(compare);

                            // Update the departments
                            this._departments.next(departments);

                            // Return the updated department
                            return updatedDepartment;
                        }),
                        switchMap((updatedDepartment) =>
                            this.department$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the department if it's selected
                                    this._department.next(updatedDepartment);

                                    // Return the updated department
                                    return updatedDepartment;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Delete the department
     *
     * @param id
     */
    deleteDepartment(department: Department): Observable<Department> {
        return this.departments$.pipe(
            take(1),
            switchMap((departments) =>
                this._httpClient
                    .put(
                        `${environment.baseApiUrl}/api/v1/followup/departments/status/` +
                            department.id,
                        department,
                    )
                    .pipe(
                        map((updatedDepartment: Department) => {
                            // Find the index of the deleted department
                            const index = departments.findIndex(
                                (item) => item.id === department.id
                            );

                            // Update the department
                            departments[index] = updatedDepartment;

                            departments.splice(index, 1);

                            // Update the departments
                            this.activateAlertDelete = true;
                            this._departments.next(departments);

                            // Return the updated department
                            return updatedDepartment;
                        })
                    )
            )
        );
    }

    /**
     * Update the avatar of the given department
     *
     * @param id
     * @param avatar
     */
    uploadAvatar(id: number, avatar: File): Observable<Department> {
        return this.departments$.pipe(
            take(1),
            switchMap((departments) =>
                this._httpClient
                    .post<Department>(
                        'api/dashboards/departments/avatar',
                        {
                            id,
                        },
                    )
                    .pipe(
                        map((updatedDepartment) => {
                            // Find the index of the updated department
                            const index = departments.findIndex(
                                (item) => item.id === id
                            );

                            // Update the department
                            departments[index] = updatedDepartment;

                            // Update the departments
                            this._departments.next(departments);

                            // Return the updated department
                            return updatedDepartment;
                        }),
                        switchMap((updateddepartment) =>
                            this.department$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the department if it's selected
                                    this._department.next(updateddepartment);

                                    // Return the updated department
                                    return updateddepartment;
                                })
                            )
                        )
                    )
            )
        );
    }
}
