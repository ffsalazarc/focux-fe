import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class CustomAuthGuard implements CanActivate {
    constructor(private _authService: AuthService, private _router: Router) {}

    /**
     * Can activate
     *
     * @param route
     * @param state
     */
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {

        if(route.data.roles && !this._authService.verifyRoles(route.data.roles)){
            if(this._authService.role === 'ROLE_BASIC' || this._authService.role === 'ROLE_MIDDLE'){
                this._router.navigateByUrl('dashboards/collaborators');
            }
            else{
                this._router.navigateByUrl('404-not-found');
            }
        }
        else{
            const redirectUrl = state.url === '/sign-out' ? '/' : state.url;
            return this._isAuthenticated(redirectUrl);
        }
    }

    canActivateChild(
        childRoute: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {

        if(childRoute.data.roles && !this._authService.verifyRoles(childRoute.data.roles)){
            if(this._authService.role === 'ROLE_BASIC' || this._authService.role === 'ROLE_MIDDLE'){
                this._router.navigateByUrl('dashboards/collaborators');
            }
            else{
                this._router.navigateByUrl('404-not-found');
            }
        }
        else{
            const redirectUrl = state.url === '/sign-out' ? '/' : state.url;
            return this._isAuthenticated(redirectUrl);
        }
    }

    private _isAuthenticated(redirectURL: string): Observable<boolean> {
        if (this._authService.isLogged()) {
            return of(true);
        } else {
            this._router
                .navigate(['sign-in'], {
                    queryParams: { redirectURL },
                })
                .then();

            return of(false);
        }
    }
}
