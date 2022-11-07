import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Search } from './focux-search.types';
import { environment } from 'environments/environment';
@Injectable({
    providedIn: 'root',
})
export class SearchService {
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) { }

    /**
     * Search  with given query
     *
     * @param query
     */
    searchCategory(query: string, searchUrl: string): Observable<Search[]> {
        const headers = new HttpHeaders({
            Authorization: 'Bearer ' + localStorage.getItem('accessToken'),
            'Content-Type': 'application/json',
        });
        return this._httpClient
            .get<Search[]>(
                `${environment.baseApiUrl}/api/v1/followup/${searchUrl}/all`,
                {
                    params: { query },
                    headers,
                }
            )
            .pipe(
                map(response => {
                    let searchFiltered: any[] = [];
                    response.forEach((search) => {
                        if (search.isActive != 0) {
                            searchFiltered.push(search);
                        }
                    });
                    if (query) {
                        searchFiltered = searchFiltered.filter(
                            (search) =>
                                search.name &&
                                search.name
                                .toLowerCase()
                                .includes(query.toLowerCase())
                                ||
                                search.lastName &&
                                search.lastName.toLowerCase()
                                .includes(query.toLowerCase())
                        );
                        function compare(a: Search, b: Search) {
                            if (a.name < b.name) return -1;
                            if (a.name > b.name) return 1;
                            if (a.lastName < b.lastName) return -1;
                            if (a.lastName > b.lastName) return 1;

                            return 0;
                        }
                        searchFiltered.sort(compare);
                        return searchFiltered;

                    } else {
                        function compare(a: Search, b: Search) {
                            if (a.name < b.name) return -1;
                            if (a.name > b.name) return 1;
                            if (a.lastName < b.lastName) return -1;
                            if (a.lastName > b.lastName) return 1;

                            return 0;
                        }
                        searchFiltered.sort(compare);
                        return searchFiltered;
                    }
                })
            );
    }

}
