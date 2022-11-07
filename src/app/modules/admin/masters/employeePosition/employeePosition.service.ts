import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { EmployeePosition, Department, CreateEmployeePosition } from 'app/modules/admin/masters/employeePosition/employeePosition.types';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class EmployeePositionsService {
    // Private
    private _activateAlert: boolean = false;
    private _activateAlertDelete: boolean = false;
    private _employeePosition: BehaviorSubject<EmployeePosition | null> =
        new BehaviorSubject(null);
    private _employeePositions: BehaviorSubject<EmployeePosition[] | null> =
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
     * Getter for employeePosition
     */
    get employeePosition$(): Observable<EmployeePosition> {
        return this._employeePosition.asObservable();
    }

    /**
     * Getter for employeePositions
     */
    get employeePositions$(): Observable<EmployeePosition[]> {
        return this._employeePositions.asObservable();
    }
    /**
     * Getter for departments
     */
    get departments$(): Observable<Department[]> {
        return this._departments.asObservable();
    }


    setEmployeePosition(employeePosition: EmployeePosition[]) {
        this._employeePositions.next(employeePosition);
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
     * Get employeePositions
     */
    getEmployeePositions(): Observable<EmployeePosition[]> {
        return this._httpClient
            .get<EmployeePosition[]>(
                `${environment.baseApiUrl}/api/v1/followup/employeePosition/all`,
            )
            .pipe(
                tap((employeePositions) => {
                    let employeePositionFiltered: any[] = [];

                    function compare(a: EmployeePosition, b: EmployeePosition) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;

                        return 0;
                    }
                    employeePositions.sort(compare);
                    employeePositions.forEach((employeePosition) => {
                        if (employeePosition.isActive != 0) {
                            employeePositionFiltered.push(employeePosition);
                        }
                    });
                    this._employeePositions.next(employeePositionFiltered);
                })
            );
    }


    /**
     * Get employeePosition by id
     */
    getEmployeePositionById(id: number): Observable<EmployeePosition> {
        return this._employeePositions.pipe(
            take(1),
            map((employeePositions) => {
                // Find the employeePosition¿

                const employeePosition =
                    employeePositions.find((item) => item.id === id) || null;

                // Update the employeePosition
                this._employeePosition.next(employeePosition);

                // Return the employeePosition

                return employeePosition;
            }),
            switchMap((employeePosition) => {
                if (!employeePosition) {
                    return throwError('El colaborador no existe !');
                }

                return of(employeePosition);
            })
        );
    }

    /**
     * Update EmployeePosition selected
     *
     */
    updateEmployeePositionSelected() {
        this._employeePosition.next(null);
    }

    /**
     * Create employeePosition
     */
    createEmployeePosition(
        newEmployeePosition: CreateEmployeePosition
    ): Observable<EmployeePosition> {
        // Generate a new employeePosition
        return this.employeePositions$.pipe(
            take(1),
            switchMap((employeePositions) =>
                this._httpClient
                    .post<EmployeePosition>(
                        `${environment.baseApiUrl}/api/v1/followup/employeePosition/save`,
                        newEmployeePosition,
                    )
                    .pipe(
                        map((newEmployeePosition) => {
                            // Update the employeePositions with the new employeePosition
                            this.activateAlert = true;
                            this._employeePositions.next([
                                newEmployeePosition,
                                ...employeePositions,
                            ]);

                            // Return the new employeePosition
                            return newEmployeePosition;
                        })
                    )
            )
        );
    }

    /**
     * Update employeePosition
     *
     * @param id
     * @param employeePosition
     */
    updateEmployeePosition(
        id: number,
        employeePosition: EmployeePosition
    ): Observable<EmployeePosition> {
        return this.employeePositions$.pipe(
            take(1),
            switchMap((employeePositions) =>
                this._httpClient
                    .put<EmployeePosition>(
                        `${environment.baseApiUrl}/api/v1/followup/employeePosition/employeePosition/` +
                            employeePosition.id,
                        employeePosition,
                    )
                    .pipe(
                        map((updatedEmployeePosition) => {
                            // Find the index of the updated employeePosition
                            const index = employeePositions.findIndex(
                                (item) => item.id === id
                            );

                            // Update the employeePosition
                            employeePositions[index] = updatedEmployeePosition;

                            function compare(
                                a: EmployeePosition,
                                b: EmployeePosition
                            ) {
                                if (a.name < b.name) return -1;
                                if (a.name > b.name) return 1;

                                return 0;
                            }
                            employeePositions.sort(compare);

                            // Update the employeePositions
                            this._employeePositions.next(employeePositions);

                            // Return the updated employeePosition
                            return updatedEmployeePosition;
                        }),
                        switchMap((updatedEmployeePosition) =>
                            this.employeePosition$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the employeePosition if it's selected
                                    this._employeePosition.next(
                                        updatedEmployeePosition
                                    );

                                    // Return the updated employeePosition
                                    return updatedEmployeePosition;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Delete the employeePosition
     *
     * @param id
     */
    deleteEmployeePosition(
        employeePosition: EmployeePosition
    ): Observable<EmployeePosition> {
        return this.employeePositions$.pipe(
            take(1),
            switchMap((employeePositions) =>
                this._httpClient
                    .put(
                        `${environment.baseApiUrl}/api/v1/followup/employeePosition/status/` +
                            employeePosition.id,
                        employeePosition,
                    )
                    .pipe(
                        map((updatedEmployeePosition: EmployeePosition) => {
                            // Find the index of the deleted employeePosition
                            const index = employeePositions.findIndex(
                                (item) => item.id === employeePosition.id
                            );

                            // Update the employeePosition
                            employeePositions[index] = updatedEmployeePosition;

                            employeePositions.splice(index, 1);

                            function compare(
                                a: EmployeePosition,
                                b: EmployeePosition
                            ) {
                                if (a.name < b.name) return -1;
                                if (a.name > b.name) return 1;

                                return 0;
                            }
                            employeePositions.sort(compare);

                            // Update the employeePositions
                            this.activateAlertDelete = true;
                            this._employeePositions.next(employeePositions);

                            // Return the updated employeePosition
                            return updatedEmployeePosition;
                        })
                    )
            )
        );
    }

    /**
     * Update the avatar of the given employeePosition
     *
     * @param id
     * @param avatar
     */
    uploadAvatar(id: number, avatar: File): Observable<EmployeePosition> {
        return this.employeePositions$.pipe(
            take(1),
            switchMap((employeePositions) =>
                this._httpClient
                    .post<EmployeePosition>(
                        'api/dashboards/employeePosition/avatar',
                        {
                            id,
                        },
                    )
                    .pipe(
                        map((updatedEmployeePosition) => {
                            // Find the index of the updated employeePosition
                            const index = employeePositions.findIndex(
                                (item) => item.id === id
                            );

                            // Update the employeePosition
                            employeePositions[index] = updatedEmployeePosition;

                            // Update the employeePositions
                            this._employeePositions.next(employeePositions);

                            // Return the updated employeePosition
                            return updatedEmployeePosition;
                        }),
                        switchMap((updatedemployeePosition) =>
                            this.employeePosition$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the employeePosition if it's selected
                                    this._employeePosition.next(
                                        updatedemployeePosition
                                    );

                                    // Return the updated employeePosition
                                    return updatedemployeePosition;
                                })
                            )
                        )
                    )
            )
        );
    }

    getDepartments(): Observable<Department[]> {
        return this._httpClient
            .get<Department[]>(
                `${environment.baseApiUrl}/api/v1/followup/departments/all`,
            )
            .pipe(
                tap((departments) => {
                    this._departments.next(departments);
                })
            );
    }
}
