import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    Validators,
    FormControl,
} from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import {
    Category,
    CreateCategory,
} from 'app/modules/admin/masters/categories/categories.types';
import { CategoriesListComponent } from 'app/modules/admin/masters/categories/list/list.component';
import { CategoriesService } from 'app/modules/admin/masters/categories/categories.service';
import { FuseAlertService } from '@fuse/components/alert';

@Component({
    selector: 'categories-details',
    templateUrl: './details.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('avatarFileInput') private _avatarFileInput: ElementRef;
    @ViewChild('knowledgesPanel') private _knowledgesPanel: TemplateRef<any>;
    @ViewChild('knowledgesPanelOrigin')
    private _knowledgesPanelOrigin: ElementRef;

    successSave: String = '';
    activatedAlert: boolean = false;
    editMode: boolean = false;

    knowledgesEditMode: boolean = false;
    isCreate: boolean = false;

    category: Category;
    categoryForm: FormGroup;
    categories: Category[];
    private _tagsPanelOverlayRef: OverlayRef;
    private _knowledgesPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _categoriesListComponent: CategoriesListComponent,
        private _categoriesService: CategoriesService,
        private _formBuilder: FormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private _fuseAlertService: FuseAlertService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Open the drawer
        this._categoriesListComponent.matDrawer.open();

        if (this._categoriesService.activateAlert) {
            this.activatedAlert = true;
            this.successSave = 'Registro creado con éxito.';
            this._fuseAlertService.show('alertBoxCategory');
        }

        // Create the category form
        this.categoryForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            description: [''],
            code: [''],
            isActive: [''],
        });

        // Get the categories
        this._categoriesService.categories$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((categories: Category[]) => {
                this.categories = categories;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the category
        this._categoriesService.category$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((category: Category) => {
                // Open the drawer in case it is closed
                this._categoriesListComponent.matDrawer.open();

                // Get the category
                this.category = category;

                if (this.category) {
                    // Patch values to the form
                    this.categoryForm.patchValue(category);

                    this.categoryForm.get('code').setValue(category.code);

                    // Toggle the edit mode off
                    this.toggleEditMode(false);
                } else {
                    this.isCreate = true;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if (!this.category) {
            this.editMode = true;
            this._categoriesListComponent.matDrawer.open();
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        // Dispose the overlays if they are still on the DOM
        if (this._knowledgesPanelOverlayRef) {
            this._knowledgesPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._categoriesListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        this._categoriesService.activateAlertDelete = false;
        if (editMode === null) {
            this.editMode = !this.editMode;
        } else {
            this.editMode = editMode;
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    returnToListView(): void {
        this._router.navigate(['../'], {
            relativeTo: this._activatedRoute,
        });
    }

    /**
     * Create the Category
     */
    createCategory(): void {
        this.categoryForm.removeControl('id', { emitEvent: false });
        let newCategory: CreateCategory = this.categoryForm.getRawValue();
        newCategory.isActive = 1;

        this._categoriesService
            .createCategory(newCategory)
            .subscribe((category: Category) => {
                // Toggle the edit mode off
                this.toggleEditMode(false);
                this.activatedAlert = true;
                const id = category.id;
                this._router.navigate(['../', id], {
                    relativeTo: this._activatedRoute,
                });
            });
    }

    /**
     * Update the category
     */
    updateCategory(): void {
        // Get the category object
        const category = this.categoryForm.getRawValue();

        // Update the category on the server
        this._categoriesService
            .updateCategory(category.id, category)
            .subscribe(() => {
                // Toggle the edit mode off
                this.toggleEditMode(false);
                this.activatedAlert = true;
                this.successSave = 'Registro editado con éxito.';
                this._fuseAlertService.show('alertBoxCategory');
            });
    }

    /**
     * Delete the category
     */
    deleteCategory(): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Borrar &Aacute;rea T&eacute;cnica',
            message:
                '\n' +
                '¿Estás seguro de que deseas eliminar esta área técnica? ¡Esta acción no se puede deshacer!',
            actions: {
                confirm: {
                    label: 'Borrar',
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Get the current category's id
                const id = this.category.id;

                // Get the next/previous category's id
                const currentCategoryIndex = this.categories.findIndex(
                    (item) => item.id === id
                );
                let nextCategoryId = null;
                if (currentCategoryIndex == this.categories.length - 1) {
                    for (let i = currentCategoryIndex - 1; i >= 0; i--) {
                        if (this.categories[i].isActive != 0) {
                            nextCategoryId = this.categories[i].id;
                        }
                    }
                } else {
                    for (
                        let i = currentCategoryIndex + 1;
                        i < this.categories.length;
                        i++
                    ) {
                        if (this.categories[i].isActive != 0) {
                            nextCategoryId = this.categories[i].id;
                        }
                    }
                }

                // Delete the category
                this.category.isActive = 0;
                this._categoriesService
                    .deleteCategory(this.category)
                    .subscribe(() => {
                        this._router.navigate(['../'], {
                            relativeTo: this._activatedRoute,
                        });

                        // Toggle the edit mode off
                        this.toggleEditMode(false);
                    });

                // Mark for check
                this._changeDetectorRef.markForCheck();
            }
        });
    }

    isNotValid(field: string): boolean {
        return (
            this.categoryForm.controls[field].errors &&
            this.categoryForm.controls[field].touched
        );
    }

    /**
     *
     * @param name
     */
    dismissFuse(name) {
        this._fuseAlertService.dismiss(name);
    }
}
