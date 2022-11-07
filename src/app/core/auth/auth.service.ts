import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from '../../../environments/environment';
import { AuthUsers } from '../../shared/models/auth-users';
import { RegisterUserResponse } from '../../shared/models/register-user-response';

@Injectable()
export class AuthService {
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    ) {}

    get authenticated(): boolean {
        return this._authenticated;
    }
    set authenticated(isAuthenticated: boolean) {
        this._authenticated = isAuthenticated;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Username
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for roles
     */
    set username(username: string) {
        localStorage.setItem('username', username);
    }

    get username(): string {
        return localStorage.getItem('username') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Roles
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for roles
     */
    get role(): string {
        return localStorage.getItem('role') ?? null;
    }

    set role(role: string) {
        localStorage.setItem('role', role);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors+
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? null;
    }

    /**
     * Setter & getter for fullName
     */
    set fullName(fullName: string) {
        localStorage.setItem('fullName', fullName);
    }

    get fullName(): string {
        return localStorage.getItem('fullName') ?? null;
    }

    /**
     * Setter & getter for mail
     */
    set mail(mail: string) {
        localStorage.setItem('mail', mail);
    }

    get mail(): string {
        return localStorage.getItem('mail') ?? null;
    }

    /**
     * Setter & getter for image
     */
    set image(image: string) {
        localStorage.setItem('image', image);
    }

    get image(): string {
        return localStorage.getItem('image') ?? null;
    }
    

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        const headers = new HttpHeaders().append(
            'Content-type',
            'application/json'
        );
        return this._httpClient
            .put(
                environment.baseApiUrl + '/api/v1/followup/user/forgotpassword',
                email,
                {
                    headers,
                }
            )
            .pipe(
                switchMap((response) => {
                    return of(response);
                })
            );
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: {
        username: string;
        password: string;
    }): Observable<AuthUsers> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient
            .post(
                environment.baseApiUrl + '/api/v1/followup/user/login',
                credentials
            )
            .pipe(
                map((response: AuthUsers) => {
                    this.authenticated = true;

                    //Set roles
                    this.role = response.authorization[0].authority;
                    this.username = response.username;
                    this.accessToken = response.token;
                    this.fullName = response.collaborator.name.concat(' ') + response.collaborator.lastName;
                    this.mail = response.collaborator.mail;
                    this.image = response.collaborator.image;
                    // Return a new observable with the response
                    return response;
                })
            );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Renew token
        return this._httpClient
            .post('/api/auth/refresh-access-token', {
                accessToken: this.accessToken,
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    // Store the access token in the local storage
                    this.accessToken = response.accessToken;

                    // Set the authenticated flag to true
                    this.authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    // Return true
                    return of(true);
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
        localStorage.removeItem('username');

        // Set the authenticated flag to false
        this.authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        username: string;
        password: string;
    }): Observable<RegisterUserResponse> {
        return this._httpClient
            .post(
                environment.baseApiUrl + '/api/v1/followup/user/register',
                user
            )
            .pipe(
                switchMap((response: RegisterUserResponse) => {
                    if (response?.data && response?.success) {
                        return of({
                            data: response.data,
                            success: response.success,
                        });
                    } else {
                        return of({ error: response.error });
                    }
                })
            );
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('/api/auth/unlock-session', credentials);
    }

    /**
     * Verify Role
     *
     * @param userRoles
     */
    verifyRoles(allowedRoles: string[]): boolean{
        let accessGranted: boolean = false;
        let start: number = 0;
        const end: number = allowedRoles.length != null ? allowedRoles.length : 0;
        while(start < end && !accessGranted){
            if(this.role === allowedRoles[start]){
                accessGranted = true;
            }
            else{
                start++;
            }
        }
        return accessGranted;
    }

    /**
     * Check the authentication status
     */
    isLogged(): boolean {
        // Check if the user is logged in
        if (this.authenticated) {
            return true;
        }


        if (this.role != null) {
            return true;
        }

        // Check the access token availability
        if (this.accessToken === null) {
            return false;
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return false;
        }
    }
}
