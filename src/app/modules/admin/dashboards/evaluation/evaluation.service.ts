import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, Subject } from 'rxjs';
import { switchMap, filter, toArray, tap, } from 'rxjs/operators';
import { Client, Collaborator, Department, Knowledge } from './evaluation.types';
import { Objetive } from '../../masters/objetives/objetives.types';
import { Indicator } from '../../masters/indicators/indicators.types';
import { MatDialog } from '@angular/material/dialog';
import { RequestService } from '../portafolio/request/request.service';
import { environment } from 'environments/environment';
@Injectable({
	providedIn: 'root'
})
export class EvaluationService {

	private _collaborators: BehaviorSubject<Collaborator[]> = new BehaviorSubject(null);
	private _department: BehaviorSubject<Department | null> = new BehaviorSubject(null);
	private _departments: BehaviorSubject<Department[] | null> = new BehaviorSubject(null);
	private _clients: BehaviorSubject<Client[] | null> = new BehaviorSubject(null);
	private _knowledges: BehaviorSubject<Knowledge[] | null> = new BehaviorSubject(null);
	private _objetives: BehaviorSubject<Objetive[] | null> = new BehaviorSubject(null);
	private _indicators: BehaviorSubject<Indicator[] | null> = new BehaviorSubject(null);
	private _collaboratorSelected: BehaviorSubject<Collaborator[] | null> = new BehaviorSubject(null);
    private _tabIndex: Subject<number> = new Subject<number>();
	private _collaboratorsSelected: Collaborator[] = [];
	private _isOpenModal: Subject<boolean | null> = new Subject();
	private _selectedTemplate = {
		id: 0,
		name: ''
	};
	private _selectedPeriod: number;

	constructor(
		private _httpClient: HttpClient,
		private dialog: MatDialog,
		private requestService: RequestService,
	) { }

	// -----------------------------------------------------------------------------------------------------
	// @ Accessors
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Getter for departments
	 *
	 */
	get departments$(): Observable<Department[]> {
		return this._departments.asObservable();
	}

	/**
	 * Getter for selectedTemplate
	 *
	 */
	get template(): any {
		return this._selectedTemplate;
	}

	/**
	 * Setter for selectedTemplate
	 *
	 */
	set template(template: any) {
		this._selectedTemplate = template;
	}

	/**
	 * Getter for selectedTemplate
	 *
	 */
	get period(): number {
		return this._selectedPeriod;
	}

	/**
	 * Setter for selectedPeriod
	 *
	 */
	set period(period: number) {
		this._selectedPeriod = period;
	}

	/**
	 * Getter for collaborators
	 *
	 */
	get collaborators$(): Observable<Collaborator[]> {
		return this._collaborators.asObservable();
	}

	/**
	 * Getter for objetives
	 *
	 */
	get objetives$(): Observable<Objetive[]> {
		return this._objetives.asObservable();
	}


	/**
	 * Getter for indicators
	 *
	 */
	get indicators$(): Observable<Indicator[]> {
		return this._indicators.asObservable();
	}

	/**
	 * Getter for clients
	 *
	 */
	get clients$(): Observable<Client[]> {
        return this._clients.asObservable();
    }

	/**
     * Getter for knowledges
     */
	 get knowledges$(): Observable<Knowledge[]> {
        return this._knowledges.asObservable();
    }

	/**
	 * Setter for _collaboratorsSelected
	 *
	 */
	set collaboratorsSelected(collaborators: Collaborator[]) {
		this._collaboratorsSelected = collaborators;
	}

	/**
	 * Getter for _collaboratorsSelected
	 *
	 */
	get collaboratorsSelected() {
		return this._collaboratorsSelected;
	}

	/**
     * Getter for ollaboratorSelected
     */
	 get collaboratorSelected$(): Observable<Collaborator[]> {
        return this._collaboratorSelected.asObservable();
    }

	/**
     * Tab index
     *
     */
	 get tabIndex$(): Observable<number> {
        return this._tabIndex.asObservable();
    }


	get isOpenModal$(): Observable<Boolean> {
        return this._isOpenModal.asObservable();
    }

	// -----------------------------------------------------------------------------------------------------
	// @ Public methods
	// -----------------------------------------------------------------------------------------------------

	/**
	 * Compare
	 *
	 */
	private _compare(a: Department, b: Department) {
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;
		return 0;
	}

	/**
     * Get Clients
     *
     */
	 getClients(): Observable<Client[]> {
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
        return this._httpClient
            .get<Client[]>(`${environment.baseApiUrl}/api/v1/followup/clients/all`, {headers})
            .pipe(
                tap((clients) => {
                    clients = clients.filter((item) => item.isActive === 1);
                    this._clients.next(clients);
                })
            );
    }

    /**
     * Get knowledges
     *
     */
    getKnowledges(): Observable<Knowledge[]> {
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
        return this._httpClient
            .get<Knowledge[]>(
                `${environment.baseApiUrl}/api/v1/followup/knowledges/all`, {headers}
            )
            .pipe(
                switchMap((knowledges) => knowledges),
                filter((knowledges) => knowledges.isActive !== 0),
                toArray(),
                tap((knowledges) => {
                    this._knowledges.next(knowledges);
                })
            );
    }

	/**
	 * Get departments
	 *
	 */
	getDepartments(): Observable<Department[]> {
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
		return this._httpClient.get<Department[]>(`${environment.baseApiUrl}/api/v1/followup/departments/all`, {headers})
			.pipe(
				switchMap((departments: Department[]) => from(departments.sort(this._compare))),
				filter(departmet => departmet.isActive !== 0),
				toArray(),
				tap(departments => {
				
					this._departments.next(departments);
				}),
			)
	}

	/**
	 * Get collaborators
	 *
	 * @returns
	 */
	getCollaborators(): Observable<Collaborator[]> {
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
		return this._httpClient.get<Collaborator[]>(`${environment.baseApiUrl}/api/v1/followup/collaborators/all`, {headers})
			.pipe(
				switchMap((collaborators: Collaborator[]) => from(collaborators)),
				filter(collaborator => collaborator.isActive !== 0),
				toArray(),
				tap(collaborators => {
					// Update the collaborators
					this._collaborators.next(collaborators);
				}),
			);
	}

	/**
	 * Get collaborators evaluated
	 *
	 * @returns
	 */
	 getCollaboratorsEvaluated(period: number = 1, departmentId: number = 1): Observable<Collaborator[]> {

		let params = new HttpParams();

		params = params.append('year', 2022);
		params = params.append('period', period);

        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
		return this._httpClient.get<Collaborator[]>(`${environment.baseApiUrl}/api/v1/followup/evaluationperformance/collaboratorsevaluated`, {
			params, headers
		}).pipe(
			switchMap((collaborators: Collaborator[]) => from(collaborators)),
			filter(collaborator => collaborator.isActive !== 0),
			toArray(),
			tap(collaborators => {
				// Update the collaborators
				this._collaborators.next(collaborators);
			}),
		);
	}

	/**
	 * Get Indicators
	 *
	 * @returns
	 */
	 getIndicators(): Observable<Indicator[]>
	 {
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
		return this._httpClient.get<Indicator[]>(`${environment.baseApiUrl}/api/v1/followup/indicator/all`, {headers}).pipe(
			tap((indicators) => {


				 let indicatorFiltered : any[]=[];

				 function compare(a: Indicator, b: Indicator) {
					 if (a.name < b.name) return -1;
					 if (a.name > b.name) return 1;


					 return 0;
				 }
				 indicators.sort(compare);
				 indicators.forEach((indicator) => {
					 if (indicator.isActive != 0){
						 indicatorFiltered.push(indicator);
					 }
				 });

				this._indicators.next(indicatorFiltered);

			 })
		 );
	 }

	/**
	 * Get objetives
	 *
	 * @returns
	 */
	getObjectives(): Observable<Objetive[]> {
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
		return this._httpClient
			.get<Objetive[]>(`${environment.baseApiUrl}/api/v1/followup/target/all`, {headers})
			.pipe(
				tap((objetives) => {
					this._objetives.next(objetives);
				})
			);
	}

	/**
     * Set collaborator selected
     *
     */
	 setCollaboratorSelected(): void {
        // Update collaborators selected
        this._collaboratorSelected.next(this.collaboratorsSelected);
    }

	/**
     * Set tab index
     *
     * @param id
     */
	 setTabIndex(tabValue: number) {
        this._tabIndex.next(tabValue);
    }

	/**
     * Close modal
     *
     *
     */
	 closeModal() {
		// Close focuxPopup
		this._isOpenModal.next(false);
    }



}


