import { Injectable} from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FuseNavigationItem } from '@fuse/components/navigation';
import { FuseMockApiService } from '@fuse/lib/mock-api';
import { compactNavigation, defaultNavigation, futuristicNavigation, horizontalNavigation } from 'app/mock-api/common/navigation/data';
import { AuthService } from 'app/core/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class NavigationMockApi
{
    private readonly _compactNavigation: FuseNavigationItem[] = compactNavigation;
    private readonly _defaultNavigation: FuseNavigationItem[] = defaultNavigation;
    private _navigationByRole: FuseNavigationItem[] = [];
    private readonly _futuristicNavigation: FuseNavigationItem[] = futuristicNavigation;
    private readonly _horizontalNavigation: FuseNavigationItem[] = horizontalNavigation;

    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService, private _authService: AuthService)
    {
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void
    {
        // -----------------------------------------------------------------------------------------------------
        // @ Navigation - GET
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/common/navigation')
            .reply(() => {
                if(!(this._authService.role === 'ROLE_GOD')){
                    this._navigationByRole = [];
                    let auxNavigationByRole: FuseNavigationItem;
                    let childrens = [];
                    let option:  FuseNavigationItem;
                    this._defaultNavigation.forEach(optionNavigation => {
                        auxNavigationByRole =  JSON.parse(JSON.stringify(optionNavigation)) ;
                        if(auxNavigationByRole.id === 'dashboards'){
                            if(this._authService.role === 'ROLE_BASIC' || this._authService.role === 'ROLE_MIDDLE'){
                                childrens = auxNavigationByRole.children.filter(elem => elem.title === 'Gestión de colaboradores');
                            }

                            if(this._authService.role === 'ROLE_MIDDLE'){
                                option = auxNavigationByRole.children.find(elem => elem.title === 'Asignación de Ocupación')
                                childrens.push(option);
                            }
                        }
                        else{
                            // Masters
                            if(this._authService.role === 'ROLE_MIDDLE'){
                                childrens = auxNavigationByRole.children.filter(elem => elem.title === 'Maestros');
                            }
                            if(this._authService.role === 'ROLE_BASIC' || this._authService.role === 'ROLE_MIDDLE'){
                                option = auxNavigationByRole.children.find(elem => elem.title === 'Colaboradores')
                                childrens.push(option);
                            }
                        }
                        auxNavigationByRole.children = childrens;
                        this._navigationByRole.push(auxNavigationByRole);
                        childrens = []
                    });
                }

                // Fill compact navigation children using the default navigation
                this._compactNavigation.forEach((compactNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if ( defaultNavItem.id === compactNavItem.id )
                        {
                            compactNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });

                // Fill futuristic navigation children using the default navigation
                this._futuristicNavigation.forEach((futuristicNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if ( defaultNavItem.id === futuristicNavItem.id )
                        {
                            futuristicNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });

                // Fill horizontal navigation children using the default navigation
                this._horizontalNavigation.forEach((horizontalNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if ( defaultNavItem.id === horizontalNavItem.id )
                        {
                            horizontalNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });

                // Return the response
                return [
                    200,
                    {
                        compact   : cloneDeep(this._compactNavigation),
                        default   : cloneDeep( this._authService.role === 'ROLE_GOD'? this._defaultNavigation:this._navigationByRole),
                        futuristic: cloneDeep(this._futuristicNavigation),
                        horizontal: cloneDeep(this._horizontalNavigation)
                    }
                ];
            });
    }
}
