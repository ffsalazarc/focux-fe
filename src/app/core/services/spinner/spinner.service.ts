import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

	private _isLoading$: Subject<boolean> = new Subject();
	
	constructor(private _spinner: NgxSpinnerService,
    ) { }

	/**
	 * Is loading
	 */
	get isLoading$(): Observable<boolean> {
		return this._isLoading$.asObservable();
	}

	/**
	 * Show
	 */
	show() {
    this._spinner.show();
		this._isLoading$.next(true);
	}

	/**
	 * Hide
	 */
	hide() {
    this._spinner.hide();

		this._isLoading$.next(false);
	}
}
