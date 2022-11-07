import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { TechnicalArea } from 'app/modules/admin/masters/technicalAreas/technicalAreas.types';
import { environment } from 'environments/environment';
import { CreateCommercialArea } from '../commercialAreas/commercialAreas.types';

@Injectable({
    providedIn: 'root',
})
export class TechnicalAreasService {
    // Private
    private _activateAlert: boolean = false;
    private _activateAlertDelete: boolean = false;
    private _technicalArea: BehaviorSubject<TechnicalArea | null> =
        new BehaviorSubject(null);
    private _technicalAreas: BehaviorSubject<TechnicalArea[] | null> =
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
     * Getter for technicalArea
     */
    get technicalArea$(): Observable<TechnicalArea> {
        return this._technicalArea.asObservable();
    }

    /**
     * Getter for technicalAreas
     */
    get technicalAreas$(): Observable<TechnicalArea[]> {
        return this._technicalAreas.asObservable();
    }

    setTechnicalAreas(technicalArea: TechnicalArea[]) {
        this._technicalAreas.next(technicalArea);
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
     * Get technicalAreas
     */
    getTechnicalAreas(): Observable<TechnicalArea[]> {
        return this._httpClient
            .get<TechnicalArea[]>(
                `${environment.baseApiUrl}/api/v1/followup/technicalareas/all`,
            )
            .pipe(
                tap((technicalAreas) => {
                    let technicalAreaFiltered: any[] = [];

                    function compare(a: TechnicalArea, b: TechnicalArea) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;

                        return 0;
                    }
                    technicalAreas.sort(compare);
                    technicalAreas.forEach((technicalArea) => {
                        if (technicalArea.isActive != 0) {
                            technicalAreaFiltered.push(technicalArea);
                        }
                    });
                    this._technicalAreas.next(technicalAreaFiltered);
                })
            );
    }


    /**
     * Get technicalArea by id
     */
    getTechnicalAreaById(id: number): Observable<TechnicalArea> {
        return this._technicalAreas.pipe(
            take(1),
            map((technicalAreas) => {
                // Find the technicalArea¿

                const technicalArea =
                    technicalAreas.find((item) => item.id === id) || null;

                // Update the technicalArea
                this._technicalArea.next(technicalArea);

                // Return the technicalArea

                return technicalArea;
            }),
            switchMap((technicalArea) => {
                if (!technicalArea) {
                    return throwError('El colaborador no existe !');
                }

                return of(technicalArea);
            })
        );
    }

    /**
     * Update technical Area selected
     *
     */
    updateTechnicalAreaSelected() {
        this._technicalArea.next(null);
    }

    /**
     * Create technicalArea
     */
    createTechnicalArea(
        newTechnicalArea: CreateCommercialArea
    ): Observable<TechnicalArea> {
        // Generate a new technicalArea
        return this.technicalAreas$.pipe(
            take(1),
            switchMap((technicalAreas) =>
                this._httpClient
                    .post<TechnicalArea>(
                        `${environment.baseApiUrl}/api/v1/followup/technicalareas/save`,
                        newTechnicalArea,
                    )
                    .pipe(
                        map((newTechnicalArea) => {
                            // Update the technicalAreas with the new technicalArea
                            this.activateAlert = true;
                            this._technicalAreas.next([
                                newTechnicalArea,
                                ...technicalAreas,
                            ]);

                            // Return the new technicalArea
                            return newTechnicalArea;
                        })
                    )
            )
        );
    }

    /**
     * Update technicalArea
     *
     * @param id
     * @param technicalArea
     */
    updateTechnicalArea(
        id: number,
        technicalArea: TechnicalArea
    ): Observable<TechnicalArea> {
        return this.technicalAreas$.pipe(
            take(1),
            switchMap((technicalAreas) =>
                this._httpClient
                    .put<TechnicalArea>(
                        `${environment.baseApiUrl}/api/v1/followup/technicalareas/technicalarea/` +
                            technicalArea.id,
                        technicalArea,
                    )
                    .pipe(
                        map((updatedTechnicalArea) => {
                            // Find the index of the updated technicalArea
                            const index = technicalAreas.findIndex(
                                (item) => item.id === id
                            );

                            // Update the technicalArea
                            technicalAreas[index] = updatedTechnicalArea;

                            function compare(
                                a: TechnicalArea,
                                b: TechnicalArea
                            ) {
                                if (a.name < b.name) return -1;
                                if (a.name > b.name) return 1;

                                return 0;
                            }
                            technicalAreas.sort(compare);

                            // Update the technicalAreas
                            this._technicalAreas.next(technicalAreas);

                            // Return the updated technicalArea
                            return updatedTechnicalArea;
                        }),
                        switchMap((updatedTechnicalArea) =>
                            this.technicalArea$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the technicalArea if it's selected
                                    this._technicalArea.next(
                                        updatedTechnicalArea
                                    );

                                    // Return the updated technicalArea
                                    return updatedTechnicalArea;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Delete the technicalArea
     *
     * @param id
     */
    deleteTechnicalArea(
        technicalArea: TechnicalArea
    ): Observable<TechnicalArea> {
        return this.technicalAreas$.pipe(
            take(1),
            switchMap((technicalAreas) =>
                this._httpClient
                    .put(
                        `${environment.baseApiUrl}/api/v1/followup/technicalareas/status/` +
                            technicalArea.id,
                        technicalArea,
                    )
                    .pipe(
                        map((updatedTechnicalArea: TechnicalArea) => {
                            // Find the index of the deleted technicalArea
                            const index = technicalAreas.findIndex(
                                (item) => item.id === technicalArea.id
                            );

                            // Update the technicalArea
                            technicalAreas[index] = updatedTechnicalArea;

                            technicalAreas.splice(index, 1);

                            function compare(
                                a: TechnicalArea,
                                b: TechnicalArea
                            ) {
                                if (a.name < b.name) return -1;
                                if (a.name > b.name) return 1;

                                return 0;
                            }
                            technicalAreas.sort(compare);

                            // Update the technicalAreas
                            this.activateAlertDelete = true;
                            this._technicalAreas.next(technicalAreas);

                            // Return the updated technicalArea
                            return updatedTechnicalArea;
                        })
                    )
            )
        );
    }

    /**
     * Update the avatar of the given technicalArea
     *
     * @param id
     * @param avatar
     */
    uploadAvatar(id: number, avatar: File): Observable<TechnicalArea> {
        return this.technicalAreas$.pipe(
            take(1),
            switchMap((technicalAreas) =>
                this._httpClient
                    .post<TechnicalArea>(
                        'api/dashboards/technicalareas/avatar',
                        {
                            id,
                        },
                    )
                    .pipe(
                        map((updatedTechnicalArea) => {
                            // Find the index of the updated technicalArea
                            const index = technicalAreas.findIndex(
                                (item) => item.id === id
                            );

                            // Update the technicalArea
                            technicalAreas[index] = updatedTechnicalArea;

                            // Update the technicalAreas
                            this._technicalAreas.next(technicalAreas);

                            // Return the updated technicalArea
                            return updatedTechnicalArea;
                        }),
                        switchMap((updatedtechnicalArea) =>
                            this.technicalArea$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the technicalArea if it's selected
                                    this._technicalArea.next(
                                        updatedtechnicalArea
                                    );

                                    // Return the updated technicalArea
                                    return updatedtechnicalArea;
                                })
                            )
                        )
                    )
            )
        );
    }
}
