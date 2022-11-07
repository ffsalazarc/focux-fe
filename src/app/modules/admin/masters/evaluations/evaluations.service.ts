import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Evaluation } from './evaluations.types';
import { Objetive } from '../objetives/objetives.types';
import { Indicator } from '../indicators/indicators.types';
import { environment } from 'environments/environment';

function compare(a: Evaluation, b: Evaluation) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;

    return 0;
}

@Injectable({
    providedIn: 'root',
})
export class EvaluationsService {
    // Private-
    private _evaluation: BehaviorSubject<Evaluation | null> =
        new BehaviorSubject(null);
    private _evaluations: BehaviorSubject<Evaluation[] | null> =
        new BehaviorSubject(null);

    private _objetive: BehaviorSubject<Objetive | null> = new BehaviorSubject(
        null
    );
    private _objetives: BehaviorSubject<Objetive[] | null> =
        new BehaviorSubject(null);

    private _indicator: BehaviorSubject<Indicator | null> = new BehaviorSubject(
        null
    );

    private _indicators: BehaviorSubject<Indicator[] | null> =
        new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    // ----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for evaluation
     */
    get evaluation$(): Observable<Evaluation> {
        return this._evaluation.asObservable();
    }

    /**
     * Getter for evaluations
     */
    get evaluations$(): Observable<Evaluation[]> {
        return this._evaluations.asObservable();
    }

    /**
     * Getter for objetive
     */
    get objetive$(): Observable<Objetive> {
        return this._objetive.asObservable();
    }

    /**
     * Getter for objetives
     */
    get objetives$(): Observable<Objetive[]> {
        return this._objetives.asObservable();
    }

    /**
     * Getter for indicator
     */
    get indicator$(): Observable<Indicator> {
        return this._indicator.asObservable();
    }

    /**
     * Getter for indicators
     */
    get indicators$(): Observable<Indicator[]> {
        return this._indicators.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get evaluations
     */
    getEvaluations(): Observable<Evaluation[]> {
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
        return this._httpClient
            .get<Evaluation[]>(
                `${environment.baseApiUrl}/api/v1/followup/evaluation/all`, {headers}
            )
            .pipe(
                tap((evaluations) => {
                    const evaluationFiltered: any[] = [];

                    evaluations.sort(compare);
                    evaluations.forEach((evaluation) => {
                        if (evaluation.isActive != 0) {
                            evaluationFiltered.push(evaluation);
                        }
                    });
                    this._evaluations.next(evaluationFiltered);
                })
            );
    }

    /**
     * Get objetives
     */
    getObjetives(): Observable<Objetive[]> {
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
        return this._httpClient
            .get<Objetive[]>(`${environment.baseApiUrl}/api/v1/followup/target/all`, {headers})
            .pipe(
                tap((objetives) => {
                    const objetiveFiltered: any[] = [];

                    function compare(a: Objetive, b: Objetive) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;

                        return 0;
                    }
                    objetives.sort(compare);
                    objetives.forEach((objetive) => {
                        if (objetive.isActive != 0) {
                            objetiveFiltered.push(objetive);
                        }
                    });
                    this._objetives.next(objetiveFiltered);
                })
            );
    }

    /**
     * Get indicators
     */
    getIndicators(): Observable<Indicator[]> {
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
        return this._httpClient
            .get<Indicator[]>(
                `${environment.baseApiUrl}/api/v1/followup/indicator/all`, {headers}
            )
            .pipe(
                tap((indicators) => {
                    let indicatorFiltered: any[] = [];

                    function compare(a: Indicator, b: Indicator) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;

                        return 0;
                    }
                    indicators.sort(compare);
                    indicators.forEach((indicator) => {
                        if (indicator.isActive != 0) {
                            indicatorFiltered.push(indicator);
                        }
                    });
                    this._indicators.next(indicatorFiltered);
                })
            );
    }

    /**
     * Search evaluations with given query
     *
     * @param query
     */
    searchEvaluation(query: string): Observable<Evaluation[]> {
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
        return this._httpClient
            .get<Evaluation[]>(
                `${environment.baseApiUrl}/api/v1/followup/evaluation/all`,
                {
                    params: { query },
                    headers
                }
            )
            .pipe(
                tap((evaluations) => {
                    let evaluationFiltered: any[] = [];
                    evaluations.forEach((evaluation) => {
                        if (evaluation.isActive != 0) {
                            evaluationFiltered.push(evaluation);
                        }
                    });
                    // If the query exists...
                    if (query) {
                        // Filter the evaluations

                        evaluationFiltered = evaluationFiltered.filter(
                            (evaluation) =>
                                evaluation.name &&
                                evaluation.name
                                    .toLowerCase()
                                    .includes(query.toLowerCase())
                        );

                        evaluationFiltered.sort(compare);
                        this._evaluations.next(evaluationFiltered);
                    }
                    evaluationFiltered.sort(compare);
                    this._evaluations.next(evaluationFiltered);
                })
            );
    }

    /**
     * Get evaluation by id
     */
    getEvaluationById(id: number): Observable<Evaluation> {
        return this._evaluations.pipe(
            take(1),
            map((evaluations) => {
                // Find the evaluation

                const evaluation =
                    evaluations.find((item) => item.id === id) || null;

                // Update the evaluation
                this._evaluation.next(evaluation);

                // Return the evaluation

                return evaluation;
            }),
            switchMap((evaluation) => {
                if (!evaluation) {
                    return throwError('La evaluacion no existe !');
                }

                return of(evaluation);
            })
        );
    }

    /**
     * Create evaluation
     */
    createEvaluation(): Observable<Evaluation> {
        // Generate a new evaluation
        const newEvaluation = {
            isActive: 1,
            minimumPercentage: 0,
            maximumPercentage: 0,
            target: { id: 1 },
            indicator: { id: 1 },
            name: 'Nuevo evaluacion',
            code: 'TEST',
        };
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
        return this.evaluations$.pipe(
            take(1),
            switchMap((evaluations) =>
                this._httpClient
                    .post<Evaluation>(
                        `${environment.baseApiUrl}/api/v1/followup/evaluation/save`,
                        newEvaluation, {headers}
                    )
                    .pipe(
                        map((newEvaluation) => {
                            // Update the evaluations with the new evaluation
                            this._evaluations.next([
                                newEvaluation,
                                ...evaluations,
                            ]);

                            // Return the new evaluation
                            return newEvaluation;
                        })
                    )
            )
        );
    }

    /**
     * Update evaluation
     *
     * @param id
     * @param evaluation
     */
    updateEvaluation(
        id: number,
        evaluation: Evaluation
    ): Observable<Evaluation> {
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
        return this.evaluations$.pipe(
            take(1),
            switchMap((evaluations) =>
                this._httpClient
                    .put<Evaluation>(
                        `${environment.baseApiUrl}/api/v1/followup/evaluation/evaluation/` +
                            evaluation.id,
                        evaluation, {headers}
                    )
                    .pipe(
                        map((updatedEvaluation) => {
                            // Find the index of the updated evaluation
                            const index = evaluations.findIndex(
                                (item) => item.id === id
                            );

                            // Update the evaluation
                            evaluations[index] = updatedEvaluation;

                            evaluations.sort(compare);

                            // Update the evaluations
                            this._evaluations.next(evaluations);

                            // Return the updated evaluation
                            return updatedEvaluation;
                        }),
                        switchMap((updatedEvaluation) =>
                            this.evaluation$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the evaluation if it's selected
                                    this._evaluation.next(updatedEvaluation);

                                    // Return the updated evaluation
                                    return updatedEvaluation;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Delete the evaluation
     *
     * @param id
     */
    deleteEvaluation(evaluation: Evaluation): Observable<Evaluation> {
        const headers = new HttpHeaders({
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
        return this.evaluations$.pipe(
            take(1),
            switchMap((evaluations) =>
                this._httpClient
                    .put(
                        `${environment.baseApiUrl}/api/v1/followup/evaluation/status/` +
                            evaluation.id,
                        evaluation, {headers}
                    )
                    .pipe(
                        map((updatedEvaluation: Evaluation) => {
                            // Find the index of the deleted evaluation
                            const index = evaluations.findIndex(
                                (item) => item.id === evaluation.id
                            );

                            // Update the evaluation
                            evaluations[index] = updatedEvaluation;

                            evaluations.splice(index, 1);

                            evaluations.sort(compare);

                            // Update the evaluations
                            this._evaluations.next(evaluations);

                            // Return the updated evaluation
                            return updatedEvaluation;
                        })
                    )
            )
        );
    }
}
