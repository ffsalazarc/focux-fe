import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import {
    BusinessType,
    CreateBusinessType,
} from 'app/modules/admin/masters/businessType/businessTypes.types';
import { environment } from 'environments/environment';
@Injectable({
    providedIn: 'root',
})
export class BusinessTypesService {
    // Private
    private _activateAlert: boolean = false;
    private _activateAlertDelete: boolean = false;
    private _businessType: BehaviorSubject<BusinessType | null> =
        new BehaviorSubject(null);
    private _businessTypes: BehaviorSubject<BusinessType[] | null> =
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
     * Getter for businessType
     */
    get businessType$(): Observable<BusinessType> {
        return this._businessType.asObservable();
    }

    /**
     * Getter for businessTypes
     */
    get businessTypes$(): Observable<BusinessType[]> {
        return this._businessTypes.asObservable();
    }

    setBusinessType(businessType: BusinessType[]) {
        this._businessTypes.next(businessType);
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
     * Get businessTypes
     */
    getBusinessTypes(): Observable<BusinessType[]> {
        return this._httpClient
            .get<BusinessType[]>(
                `${environment.baseApiUrl}/api/v1/followup/businesstype/all`,
            )
            .pipe(
                tap((businessTypes) => {
                    let businessTypeFiltered: any[] = [];

                    function compare(a: BusinessType, b: BusinessType) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;

                        return 0;
                    }
                    businessTypes.sort(compare);
                    businessTypes.forEach((businessType) => {
                        if (businessType.isActive != 0) {
                            businessTypeFiltered.push(businessType);
                        }
                    });
                    this._businessTypes.next(businessTypeFiltered);
                })
            );
    }

    /**
     * Get businessType by id
     */
    getBusinessTypeById(id: number): Observable<BusinessType> {
        return this._businessTypes.pipe(
            take(1),
            map((businessTypes) => {
                // Find the businessType¿

                const businessType =
                    businessTypes.find((item) => item.id === id) || null;

                // Update the businessType
                this._businessType.next(businessType);

                // Return the businessType

                return businessType;
            }),
            switchMap((businessType) => {
                if (!businessType) {
                    return throwError('El colaborador no existe !');
                }

                return of(businessType);
            })
        );
    }

    /**
     * Update Business Type selected
     *
     */
    updateBusinessTypeSelected() {
        this._businessType.next(null);
    }

    /**
     * Create businessType
     */
    createBusinessType(
        newBusinessType: CreateBusinessType
    ): Observable<BusinessType> {
        // Generate a new businessType
        return this.businessTypes$.pipe(
            take(1),
            switchMap((businessTypes) =>
                this._httpClient
                    .post<BusinessType>(
                        `${environment.baseApiUrl}/api/v1/followup/businesstype/save`,
                        newBusinessType,

                    )
                    .pipe(
                        map((newBusinessType) => {
                            // Update the businessTypes with the new businessType
                            this.activateAlert = true;
                            this._businessTypes.next([
                                newBusinessType,
                                ...businessTypes,
                            ]);

                            // Return the new businessType
                            return newBusinessType;
                        })
                    )
            )
        );
    }

    /**
     * Update businessType
     *
     * @param id
     * @param businessType
     */
    updateBusinessType(
        id: number,
        businessType: BusinessType
    ): Observable<BusinessType> {
        return this.businessTypes$.pipe(
            take(1),
            switchMap((businessTypes) =>
                this._httpClient
                    .put<BusinessType>(
                        `${environment.baseApiUrl}/api/v1/followup/businesstype/businesstype/` +
                            businessType.id,
                        businessType,

                    )
                    .pipe(
                        map((updatedBusinessType) => {
                            // Find the index of the updated businessType
                            const index = businessTypes.findIndex(
                                (item) => item.id === id
                            );

                            // Update the businessType
                            businessTypes[index] = updatedBusinessType;

                            function compare(a: BusinessType, b: BusinessType) {
                                if (a.name < b.name) return -1;
                                if (a.name > b.name) return 1;

                                return 0;
                            }
                            businessTypes.sort(compare);

                            // Update the businessTypes
                            this._businessTypes.next(businessTypes);

                            // Return the updated businessType
                            return updatedBusinessType;
                        }),
                        switchMap((updatedBusinessType) =>
                            this.businessType$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the businessType if it's selected
                                    this._businessType.next(
                                        updatedBusinessType
                                    );

                                    // Return the updated businessType
                                    return updatedBusinessType;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Delete the businessType
     *
     * @param id
     */
    deleteBusinessType(businessType: BusinessType): Observable<BusinessType> {
        return this.businessTypes$.pipe(
            take(1),
            switchMap((businessTypes) =>
                this._httpClient
                    .put(
                        `${environment.baseApiUrl}/api/v1/followup/businesstype/status/` +
                            businessType.id,
                        businessType,

                    )
                    .pipe(
                        map((updatedBusinessType: BusinessType) => {
                            // Find the index of the deleted businessType
                            const index = businessTypes.findIndex(
                                (item) => item.id === businessType.id
                            );

                            // Update the businessType
                            businessTypes[index] = updatedBusinessType;

                            businessTypes.splice(index, 1);

                            function compare(a: BusinessType, b: BusinessType) {
                                if (a.name < b.name) return -1;
                                if (a.name > b.name) return 1;

                                return 0;
                            }
                            businessTypes.sort(compare);

                            // Update the businessTypes
                            this.activateAlertDelete = true;
                            this._businessTypes.next(businessTypes);

                            // Return the updated businessType
                            return updatedBusinessType;
                        })
                    )
            )
        );
    }

    /**
     * Update the avatar of the given businessType
     *
     * @param id
     * @param avatar
     */
    uploadAvatar(id: number, avatar: File): Observable<BusinessType> {
        return this.businessTypes$.pipe(
            take(1),
            switchMap((businessTypes) =>
                this._httpClient
                    .post<BusinessType>(
                        `api/dashboards/businesstype/avatar`,
                        {
                            id,
                        },

                    )
                    .pipe(
                        map((updatedBusinessType) => {
                            // Find the index of the updated businessType
                            const index = businessTypes.findIndex(
                                (item) => item.id === id
                            );

                            // Update the businessType
                            businessTypes[index] = updatedBusinessType;

                            // Update the businessTypes
                            this._businessTypes.next(businessTypes);

                            // Return the updated businessType
                            return updatedBusinessType;
                        }),
                        switchMap((updatedbusinessType) =>
                            this.businessType$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the businessType if it's selected
                                    this._businessType.next(
                                        updatedbusinessType
                                    );

                                    // Return the updated businessType
                                    return updatedbusinessType;
                                })
                            )
                        )
                    )
            )
        );
    }
}
