import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Client, BusinessType, CreateClient } from 'app/modules/admin/masters/clients/clients.types';
import { environment } from 'environments/environment';
@Injectable({
    providedIn: 'root',
})
export class ClientsService {
    // Private
    private _activateAlert: boolean = false;
    private _activateAlertDelete: boolean = false;
    private _client: BehaviorSubject<Client | null> = new BehaviorSubject(null);
    private _clients: BehaviorSubject<Client[] | null> = new BehaviorSubject(
        null
    );
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
     * Getter for client
     */
    get client$(): Observable<Client> {
        return this._client.asObservable();
    }

    /**
     * Getter for clients
     */
    get clients$(): Observable<Client[]> {
        return this._clients.asObservable();
    }
    /**
     * Getter for businessTypes
     */
    get businessTypes$(): Observable<BusinessType[]> {
        return this._businessTypes.asObservable();
    }

    setClients(client: Client[]) {
        this._clients.next(client);
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
     * Get clients
     */
    getClients(): Observable<Client[]> {
        return this._httpClient
            .get<Client[]>(
                `${environment.baseApiUrl}/api/v1/followup/clients/all`,

            )
            .pipe(
                tap((clients) => {
                    let clientFiltered: any[] = [];

                    function compare(a: Client, b: Client) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;

                        return 0;
                    }
                    clients.sort(compare);
                    clients.forEach((client) => {
                        if (client.isActive != 0) {
                            clientFiltered.push(client);
                        }
                    });
                    this._clients.next(clientFiltered);
                })
            );
    }


    /**
     * Get client by id
     */
    getClientById(id: number): Observable<Client> {
        return this._clients.pipe(
            take(1),
            map((clients) => {
                // Find the client¿

                const client = clients.find((item) => item.id === id) || null;
                // Update the client
                this._client.next(client);

                // Return the client

                return client;
            }),
            switchMap((client) => {
                if (!client) {
                    return throwError('El colaborador no existe !');
                }

                return of(client);
            })
        );
    }

    /**
     * Update Client selected
     *
     */
    updateClientSelected() {
        this._client.next(null);
    }

    /**
     * Create client
     */
    createClient(newClient: CreateClient): Observable<Client> {
        // Generate a new client
        const headers = new HttpHeaders({
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
        return this.clients$.pipe(
            take(1),
            switchMap((clients) =>
                this._httpClient
                    .post<Client>(
                        `${environment.baseApiUrl}/api/v1/followup/clients/save`,
                        newClient,
                    )
                    .pipe(
                        map((newClient) => {
                            // Update the clients with the new client
                            this.activateAlert = true;
                            this._clients.next([newClient, ...clients]);

                            // Return the new client
                            return newClient;
                        })
                    )
            )
        );
    }

    /**
     * Update client
     *
     * @param id
     * @param client
     */
    updateClient(id: number, client: Client): Observable<Client> {
        const headers = new HttpHeaders({
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
        return this.clients$.pipe(
            take(1),
            switchMap((clients) =>
                this._httpClient
                    .put<Client>(
                        `${environment.baseApiUrl}/api/v1/followup/clients/client/` +
                            client.id,
                        client,

                    )
                    .pipe(
                        map((updatedClient) => {
                            // Find the index of the updated client
                            const index = clients.findIndex(
                                (item) => item.id === id
                            );

                            // Update the client
                            clients[index] = updatedClient;

                            function compare(a: Client, b: Client) {
                                if (a.name < b.name) return -1;
                                if (a.name > b.name) return 1;

                                return 0;
                            }
                            clients.sort(compare);

                            // Update the clients
                            this._clients.next(clients);

                            // Return the updated client
                            return updatedClient;
                        }),
                        switchMap((updatedClient) =>
                            this.client$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the client if it's selected
                                    this._client.next(updatedClient);

                                    // Return the updated client
                                    return updatedClient;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Delete the client
     *
     * @param id
     */
    deleteClient(client: Client): Observable<Client> {

        return this.clients$.pipe(
            take(1),
            switchMap((clients) =>
                this._httpClient
                    .put(
                        `${environment.baseApiUrl}/api/v1/followup/clients/status/` +
                            client.id,
                        client,

                    )
                    .pipe(
                        map((updatedClient: Client) => {
                            // Find the index of the deleted client
                            const index = clients.findIndex(
                                (item) => item.id === client.id
                            );

                            // Update the client
                            clients[index] = updatedClient;

                            clients.splice(index, 1);

                            // Update the clients
                            this.activateAlertDelete = true;
                            this._clients.next(clients);

                            // Return the updated client
                            return updatedClient;
                        })
                    )
            )
        );
    }

    /**
     * Update the avatar of the given client
     *
     * @param id
     * @param avatar
     */
    uploadAvatar(id: number, avatar: File): Observable<Client> {
        return this.clients$.pipe(
            take(1),
            switchMap((clients) =>
                this._httpClient
                    .post<Client>(
                        'api/dashboards/clients/avatar',
                        {
                            id,
                        },

                    )
                    .pipe(
                        map((updatedClient) => {
                            // Find the index of the updated client
                            const index = clients.findIndex(
                                (item) => item.id === id
                            );

                            // Update the client
                            clients[index] = updatedClient;

                            // Update the clients
                            this._clients.next(clients);

                            // Return the updated client
                            return updatedClient;
                        }),
                        switchMap((updatedclient) =>
                            this.client$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the client if it's selected
                                    this._client.next(updatedclient);

                                    // Return the updated client
                                    return updatedclient;
                                })
                            )
                        )
                    )
            )
        );
    }

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
}
