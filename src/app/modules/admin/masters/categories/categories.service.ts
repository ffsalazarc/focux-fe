import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Category, CreateCategory } from 'app/modules/admin/masters/categories/categories.types';
import { environment } from 'environments/environment';
@Injectable({
    providedIn: 'root',
})
export class CategoriesService {
    // Private
    private _activateAlert: boolean = false;
    private _activateAlertDelete: boolean = false;
    private _category: BehaviorSubject<Category | null> = new BehaviorSubject(
        null
    );
    private _categories: BehaviorSubject<Category[] | null> =
        new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) { }

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
     * Getter for category
     */
    get category$(): Observable<Category> {
        return this._category.asObservable();
    }

    /**
     * Getter for categories
     */
    get categories$(): Observable<Category[]> {
        return this._categories.asObservable();
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

    setCategories(categories: Category[]) {
        this._categories.next(categories);
    }

    /**
     * Get categories
     */
    getCategories(): Observable<Category[]> {
        return this._httpClient
            .get<Category[]>(
                `${environment.baseApiUrl}/api/v1/followup/categories/all`,
            )
            .pipe(
                tap((categories) => {
                    const categoryFiltered: any[] = [];

                    function compare(a: Category, b: Category) {
                        if (a.name < b.name) return -1;
                        if (a.name > b.name) return 1;

                        return 0;
                    }
                    categories.sort(compare);
                    categories.forEach((category) => {
                        if (category.isActive != 0) {
                            categoryFiltered.push(category);
                        }
                    });
                    this._categories.next(categoryFiltered);
                })
            );
    }


    /**
     * Get category by id
     */
    getCategoryById(id: number): Observable<Category> {
        return this._categories.pipe(
            take(1),
            map((categories) => {
                // Find the category¿

                const category =
                    categories.find((item) => item.id === id) || null;

                // Update the category
                this._category.next(category);

                // Return the category

                return category;
            }),
            switchMap((category) => {
                if (!category) {
                    return throwError('El colaborador no existe !');
                }

                return of(category);
            })
        );
    }

    /**
     * Update Type Request selected
     *
     */
    updateCategorySelected(): void {
        return this._category.next(null);
    }

    /**
     * Create category
     */
    createCategory(newCategory: CreateCategory): Observable<Category> {
        return this.categories$.pipe(
            take(1),
            switchMap((categories) =>
                this._httpClient
                    .post<Category>(
                        `${environment.baseApiUrl}/api/v1/followup/categories/save`,
                        newCategory,

                    )
                    .pipe(
                        map((newCategory) => {
                            // Update the categories with the new category
                            this.activateAlert = true;
                            this._categories.next([newCategory, ...categories]);

                            // Return the new category
                            return newCategory;
                        })
                    )
            )
        );
    }

    /**
     * Update category
     *
     * @param id
     * @param category
     */
    updateCategory(id: number, category: Category): Observable<Category> {
        return this.categories$.pipe(
            take(1),
            switchMap((categories) =>
                this._httpClient
                    .put<Category>(
                        `${environment.baseApiUrl}/api/v1/followup/categories/category/` +
                        category.id,
                        category,

                    )
                    .pipe(
                        map((updatedCategory) => {
                            // Find the index of the updated category
                            const index = categories.findIndex(
                                (item) => item.id === id
                            );

                            // Update the category
                            categories[index] = updatedCategory;

                            function compare(a: Category, b: Category) {
                                if (a.name < b.name) return -1;
                                if (a.name > b.name) return 1;

                                return 0;
                            }
                            categories.sort(compare);

                            // Update the categories
                            this._categories.next(categories);

                            // Return the updated category
                            return updatedCategory;
                        }),
                        switchMap((updatedCategory) =>
                            this.category$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the category if it's selected
                                    this._category.next(updatedCategory);

                                    // Return the updated category
                                    return updatedCategory;
                                })
                            )
                        )
                    )
            )
        );
    }

    /**
     * Delete the category
     *
     * @param id
     */
    deleteCategory(category: Category): Observable<Category> {
        return this.categories$.pipe(
            take(1),
            switchMap((categories) =>
                this._httpClient
                    .put(
                        `${environment.baseApiUrl}/api/v1/followup/categories/status/` +
                        category.id,
                        category,

                    )
                    .pipe(
                        map((updatedCategory: Category) => {
                            // Find the index of the deleted category
                            const index = categories.findIndex(
                                (item) => item.id === category.id
                            );

                            // Update the category
                            categories[index] = updatedCategory;

                            categories.splice(index, 1);

                            function compare(a: Category, b: Category) {
                                if (a.name < b.name) return -1;
                                if (a.name > b.name) return 1;

                                return 0;
                            }
                            categories.sort(compare);

                            // Update the categories
                            this.activateAlertDelete = true;
                            this._categories.next(categories);

                            // Return the updated category
                            return updatedCategory;
                        })
                    )
            )
        );
    }

    /**
     * Update the avatar of the given category
     *
     * @param id
     * @param avatar
     */
    uploadAvatar(id: number, avatar: File): Observable<Category> {
        return this.categories$.pipe(
            take(1),
            switchMap((categories) =>
                this._httpClient
                    .post<Category>(
                        'api/dashboards/categories/avatar',
                        {
                            id,
                        },

                    )
                    .pipe(
                        map((updatedCategory) => {
                            // Find the index of the updated category
                            const index = categories.findIndex(
                                (item) => item.id === id
                            );

                            // Update the category
                            categories[index] = updatedCategory;

                            // Update the categories
                            this._categories.next(categories);

                            // Return the updated category
                            return updatedCategory;
                        }),
                        switchMap((updatedcategory) =>
                            this.category$.pipe(
                                take(1),
                                filter((item) => item && item.id === id),
                                tap(() => {
                                    // Update the category if it's selected
                                    this._category.next(updatedcategory);

                                    // Return the updated category
                                    return updatedcategory;
                                })
                            )
                        )
                    )
            )
        );
    }
}
