import { Injectable } from '@angular/core';
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor,
	HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { finalize } from 'rxjs/operators';
import { SpinnerService } from '../services/spinner/spinner.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class InterceptorRequestInterceptor implements HttpInterceptor {

  headers: HttpHeaders = new HttpHeaders({
		'Accept': 'application/json',
		'Content-Type': 'text/json'
	});

	constructor(
		private _storageService: AuthService,
		private _spinnerService: SpinnerService,
    
		) {
		const token: string | null = this._storageService.accessToken;

		this.headers.append('x-auth-token', token ? token : '');
	}

	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		const token: any = this._storageService.accessToken;
		this._spinnerService.show();

		let req = request;
    
		if ( token ) {
			req = request.clone({
				setHeaders: {
					 Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
					'Content-Type': 'application/json',
				},
			},
			)
		}
		
		return next.handle(req).pipe(
			finalize(() => this._spinnerService.hide())
		);
	}
}
