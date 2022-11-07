import { Route } from '@angular/router';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';
import { CustomAuthGuard } from './core/guards/custom-auth.guard';
import {ACCESS_ROLES} from './core/auth/roles.types';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [
    // Redirect empty path to '/dashboards/project'
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboards/project',
    },

    // Redirect signed in user to the '/dashboards/project'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {
        path: 'signed-in-redirect',
        pathMatch: 'full',
        redirectTo: 'dashboards/project',
    },

    // Auth routes for guests
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'confirmation-required',
                loadChildren: () =>
                    import(
                        'app/modules/auth/confirmation-required/confirmation-required.module'
                    ).then((m) => m.AuthConfirmationRequiredModule),
            },
            {
                path: 'forgot-password',
                loadChildren: () =>
                    import(
                        'app/modules/auth/forgot-password/forgot-password.module'
                    ).then((m) => m.AuthForgotPasswordModule),
            },
            {
                path: 'reset-password',
                loadChildren: () =>
                    import(
                        'app/modules/auth/reset-password/reset-password.module'
                    ).then((m) => m.AuthResetPasswordModule),
            },
            {
                path: 'sign-in',
                loadChildren: () =>
                    import('app/modules/auth/sign-in/sign-in.module').then(
                        (m) => m.AuthSignInModule
                    ),
            },
            {
                path: 'sign-up',
                loadChildren: () =>
                    import('app/modules/auth/sign-up/sign-up.module').then(
                        (m) => m.AuthSignUpModule
                    ),
            },
        ],
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [CustomAuthGuard],
        canActivateChild: [CustomAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'sign-out',
                loadChildren: () =>
                    import('app/modules/auth/sign-out/sign-out.module').then(
                        (m) => m.AuthSignOutModule
                    ),
            },
            {
                path: 'unlock-session',
                loadChildren: () =>
                    import(
                        'app/modules/auth/unlock-session/unlock-session.module'
                    ).then((m) => m.AuthUnlockSessionModule),
            },
        ],
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty',
        },
        children: [
            {
                path: 'home',
                loadChildren: () =>
                    import('app/modules/landing/home/home.module').then(
                        (m) => m.LandingHomeModule
                    ),
            },
        ],
    },

    // Admin routes
    {
        path: '',
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },
        children: [
            // Dashboards
            {
                path: 'dashboards',
                canActivate: [CustomAuthGuard],
                canActivateChild: [CustomAuthGuard],
                children: [
                    {
                        path: 'project',
                        data: {roles: ACCESS_ROLES.projects},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/dashboards/project/project.module'
                            ).then((m) => m.ProjectModule),
                    },
                    {
                        path: 'analytics',
                        data: {roles: ACCESS_ROLES.analytics},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/dashboards/analytics/analytics.module'
                            ).then((m) => m.AnalyticsModule),
                    },
                    {
                        path: 'finance',
                        data: {roles: ACCESS_ROLES.finance},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/dashboards/finance/finance.module'
                            ).then((m) => m.FinanceModule),
                    },
                    {
                        path: 'crypto',
                        data: {roles: ACCESS_ROLES.crypto},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/dashboards/crypto/crypto.module'
                            ).then((m) => m.CryptoModule),
                    },
                    // {
                    //     path: 'requestPanel',
                    //     data: {roles: ACCESS_ROLES.requestPanel},
                    //     loadChildren: () =>
                    //         import(
                    //             'app/modules/admin/dashboards/requestPanel/requestPanel.module'
                    //         ).then((m) => m.RequestPanelModule),
                    // },
                    {
                        path: 'collaborators',
                        data: {roles: ACCESS_ROLES.collaborators},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/dashboards/collaborators/collaborators.module'
                            ).then((m) => m.CollaboratorsModule),
                    },
                    {
                        path: 'portafolio',
                        data: {roles: ACCESS_ROLES.portafolio},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/dashboards/portafolio/portafolio.module'
                            ).then((m) => m.PortafolioModule),
                    },
                    {
                        path: 'assignment-occupation',
                        data: {roles: ACCESS_ROLES.assignment},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/dashboards/assignment-occupation/assignment-occupation.module'
                            ).then((m) => m.AssignmentOccupationModule),
                    },
                    {
                        path: 'vacations',
                        data: {roles: ACCESS_ROLES.vacations},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/dashboards/vacations/vacations.module'
                            ).then((m) => m.VacationsModule),
                    },
                    {
                        path: 'evaluation',
                        data: {roles: ACCESS_ROLES.evaluation},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/dashboards/evaluation/evaluation.module'
                            ).then((m) => m.EvaluationModule),
                    },
                ],
            },

            // Apps
            {
                path: 'apps',
                canActivate: [CustomAuthGuard],
                canActivateChild: [CustomAuthGuard],
                children: [
                    {
                        path: 'academy',
                        data: {roles: ACCESS_ROLES.academy},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/academy/academy.module'
                            ).then((m) => m.AcademyModule),
                    },
                    {
                        path: 'calendar',
                        data: {roles: ACCESS_ROLES.calendar},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/calendar/calendar.module'
                            ).then((m) => m.CalendarModule),
                    },
                    {
                        path: 'chat',
                        data: {roles: ACCESS_ROLES.chat},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/chat/chat.module'
                            ).then((m) => m.ChatModule),
                    },
                    {
                        path: 'contacts',
                        data: {roles: ACCESS_ROLES.contacts},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/contacts/contacts.module'
                            ).then((m) => m.ContactsModule),
                    },
                    {
                        path: 'ecommerce',
                        data: {roles: ACCESS_ROLES.ecommerce},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/ecommerce/ecommerce.module'
                            ).then((m) => m.ECommerceModule),
                    },
                    {
                        path: 'file-manager',
                        data: {roles: ACCESS_ROLES.file},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/file-manager/file-manager.module'
                            ).then((m) => m.FileManagerModule),
                    },
                    {
                        path: 'help-center',
                        data: {roles: ACCESS_ROLES.help},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/help-center/help-center.module'
                            ).then((m) => m.HelpCenterModule),
                    },
                    {
                        path: 'mailbox',
                        data: {roles: ACCESS_ROLES.mail},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/mailbox/mailbox.module'
                            ).then((m) => m.MailboxModule),
                    },
                    {
                        path: 'notes',
                        data: {roles: ACCESS_ROLES.notes},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/notes/notes.module'
                            ).then((m) => m.NotesModule),
                    },
                    {
                        path: 'scrumboard',
                        data: {roles: ACCESS_ROLES.scrumboard},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/scrumboard/scrumboard.module'
                            ).then((m) => m.ScrumboardModule),
                    },
                    {
                        path: 'tasks',
                        data: {roles: ACCESS_ROLES.tasks},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/apps/tasks/tasks.module'
                            ).then((m) => m.TasksModule),
                    },
                    // {
                    //     path: 'portafolio',
                    //     data: {roles: ACCESS_ROLES.portafolio},
                    //     loadChildren: () =>
                    //         import(
                    //             'app/modules/admin/apps/portafolio/portafolio.module'
                    //         ).then((m) => m.PortafolioModule),
                    // },
                    {
                        path: 'clients',
                        data: {roles: ACCESS_ROLES.clients},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/clients/clients.module'
                            ).then((m) => m.ClientsModule),
                    },
                ],
            },

            // Masters
            {
                path: 'masters',
                canActivate: [CustomAuthGuard],
                canActivateChild: [CustomAuthGuard],
                children: [
                    {
                        path: 'clients',
                        data: {roles: ACCESS_ROLES.clients},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/clients/clients.module'
                            ).then((m) => m.ClientsModule),
                    },
                    {
                        path: 'employeePosition',
                        data: {roles: ACCESS_ROLES.employeePosition},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/employeePosition/employeePosition.module'
                            ).then((m) => m.EmployeePositionModule),
                    },
                    {
                        path: 'departments',
                        data: {roles: ACCESS_ROLES.departments},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/departments/departments.module'
                            ).then((m) => m.DepartmentsModule),
                    },
                    {
                        path: 'knowledges',
                        data: {roles: ACCESS_ROLES.knowledges},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/knowledges/knowledges.module'
                            ).then((m) => m.KnowledgesModule),
                    },
                    {
                        path: 'businessTypes',
                        data: {roles: ACCESS_ROLES.businessTypes},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/businessType/businessTypes.module'
                            ).then((m) => m.BusinessTypesModule),
                    },

                    {
                        path: 'typesRequest',
                        data: {roles: ACCESS_ROLES.typesRequest},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/typeRequest/typeRequest.module'
                            ).then((m) => m.TypeRequestModule),
                    },
                    {
                        path: 'requestRole',
                        data: {roles: ACCESS_ROLES.requestRole},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/requestRole/requestRole.module'
                            ).then((m) => m.RequestRoleModule),
                    },
                    {
                        path: 'categories',
                        data: {roles: ACCESS_ROLES.categories},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/categories/categories.module'
                            ).then((m) => m.CategoriesModule),
                    },
                    {
                        path: 'technicalAreas',
                        data: {roles: ACCESS_ROLES.technicalAreas},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/technicalAreas/technicalAreas.module'
                            ).then((m) => m.TechnicalAreasModule),
                    },
                    {
                        path: 'commercialAreas',
                        data: {roles: ACCESS_ROLES.commercialAreas},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/commercialAreas/commercialAreas.module'
                            ).then((m) => m.CommercialAreasModule),
                    },
                    {
                        path: 'statuses',
                        data: {roles: ACCESS_ROLES.statuses},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/statuses/statuses.module'
                            ).then((m) => m.StatusesModule),
                    },
                    {
                        path: 'indicators',
                        data: {roles: ACCESS_ROLES.indicators},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/indicators/indicators.module'
                            ).then((m) => m.IndicatorsModule),
                    },
                    {
                        path: 'objetives',
                        data: {roles: ACCESS_ROLES.objetives},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/objetives/objetives.module'
                            ).then((m) => m.ObjetivesModule),
                    },
                    {
                        path: 'evaluations',
                        data: {roles: ACCESS_ROLES.evaluations},
                        loadChildren: () =>
                            import(
                                'app/modules/admin/masters/evaluations/evaluations.module'
                            ).then((m) => m.EvaluationsModule),
                    },
                ],
            },

            // Pages
            {
                path: 'pages',
                canActivate: [CustomAuthGuard],
                canActivateChild: [CustomAuthGuard],
                children: [
                    // Activities
                    {
                        path: 'activities',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/pages/activities/activities.module'
                            ).then((m) => m.ActivitiesModule),
                    },

                    // Authentication
                    {
                        path: 'authentication',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/pages/authentication/authentication.module'
                            ).then((m) => m.AuthenticationModule),
                    },

                    // Coming Soon
                    {
                        path: 'coming-soon',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/pages/coming-soon/coming-soon.module'
                            ).then((m) => m.ComingSoonModule),
                    },

                    // Error
                    {
                        path: 'error',
                        children: [
                            {
                                path: '404',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/pages/error/error-404/error-404.module'
                                    ).then((m) => m.Error404Module),
                            },
                            {
                                path: '500',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/pages/error/error-500/error-500.module'
                                    ).then((m) => m.Error500Module),
                            },
                        ],
                    },

                    // Invoice
                    {
                        path: 'invoice',
                        children: [
                            {
                                path: 'printable',
                                children: [
                                    {
                                        path: 'compact',
                                        loadChildren: () =>
                                            import(
                                                'app/modules/admin/pages/invoice/printable/compact/compact.module'
                                            ).then((m) => m.CompactModule),
                                    },
                                    {
                                        path: 'modern',
                                        loadChildren: () =>
                                            import(
                                                'app/modules/admin/pages/invoice/printable/modern/modern.module'
                                            ).then((m) => m.ModernModule),
                                    },
                                ],
                            },
                        ],
                    },

                    // Maintenance
                    {
                        path: 'maintenance',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/pages/maintenance/maintenance.module'
                            ).then((m) => m.MaintenanceModule),
                    },

                    // Pricing
                    {
                        path: 'pricing',
                        children: [
                            {
                                path: 'modern',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/pages/pricing/modern/modern.module'
                                    ).then((m) => m.PricingModernModule),
                            },
                            {
                                path: 'simple',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/pages/pricing/simple/simple.module'
                                    ).then((m) => m.PricingSimpleModule),
                            },
                            {
                                path: 'single',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/pages/pricing/single/single.module'
                                    ).then((m) => m.PricingSingleModule),
                            },
                            {
                                path: 'table',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/pages/pricing/table/table.module'
                                    ).then((m) => m.PricingTableModule),
                            },
                        ],
                    },

                    // Profile
                    {
                        path: 'profile',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/pages/profile/profile.module'
                            ).then((m) => m.ProfileModule),
                    },

                    // Settings
                    {
                        path: 'settings',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/pages/settings/settings.module'
                            ).then((m) => m.SettingsModule),
                    },
                ],
            },

            // User Interface
            {
                path: 'ui',
                canActivate: [CustomAuthGuard],
                canActivateChild: [CustomAuthGuard],
                children: [
                    // Material Components
                    {
                        path: 'material-components',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/material-components/material-components.module'
                            ).then((m) => m.MaterialComponentsModule),
                    },

                    // Fuse Components
                    {
                        path: 'fuse-components',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/fuse-components/fuse-components.module'
                            ).then((m) => m.FuseComponentsModule),
                    },

                    // Other Components
                    {
                        path: 'other-components',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/other-components/other-components.module'
                            ).then((m) => m.OtherComponentsModule),
                    },

                    // TailwindCSS
                    {
                        path: 'tailwindcss',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/tailwindcss/tailwindcss.module'
                            ).then((m) => m.TailwindCSSModule),
                    },

                    // Advanced Search
                    {
                        path: 'advanced-search',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/advanced-search/advanced-search.module'
                            ).then((m) => m.AdvancedSearchModule),
                    },

                    // Animations
                    {
                        path: 'animations',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/animations/animations.module'
                            ).then((m) => m.AnimationsModule),
                    },

                    // Cards
                    {
                        path: 'cards',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/cards/cards.module'
                            ).then((m) => m.CardsModule),
                    },

                    // Colors
                    {
                        path: 'colors',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/colors/colors.module'
                            ).then((m) => m.ColorsModule),
                    },

                    // Confirmation Dialog
                    {
                        path: 'confirmation-dialog',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/confirmation-dialog/confirmation-dialog.module'
                            ).then((m) => m.ConfirmationDialogModule),
                    },

                    // Datatable
                    {
                        path: 'datatable',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/datatable/datatable.module'
                            ).then((m) => m.DatatableModule),
                    },

                    // Forms
                    {
                        path: 'forms',
                        children: [
                            {
                                path: 'fields',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/ui/forms/fields/fields.module'
                                    ).then((m) => m.FormsFieldsModule),
                            },
                            {
                                path: 'layouts',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/ui/forms/layouts/layouts.module'
                                    ).then((m) => m.FormsLayoutsModule),
                            },
                            {
                                path: 'wizards',
                                loadChildren: () =>
                                    import(
                                        'app/modules/admin/ui/forms/wizards/wizards.module'
                                    ).then((m) => m.FormsWizardsModule),
                            },
                        ],
                    },

                    // Icons
                    {
                        path: 'icons',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/icons/icons.module'
                            ).then((m) => m.IconsModule),
                    },

                    // Page Layouts
                    {
                        path: 'page-layouts',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/page-layouts/page-layouts.module'
                            ).then((m) => m.PageLayoutsModule),
                    },

                    // Typography
                    {
                        path: 'typography',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/ui/typography/typography.module'
                            ).then((m) => m.TypographyModule),
                    },
                ],
            },

            // Documentation
            {
                path: 'docs',
                canActivate: [CustomAuthGuard],
                canActivateChild: [CustomAuthGuard],
                children: [
                    // Changelog
                    {
                        path: 'changelog',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/docs/changelog/changelog.module'
                            ).then((m) => m.ChangelogModule),
                    },

                    // Guides
                    {
                        path: 'guides',
                        loadChildren: () =>
                            import(
                                'app/modules/admin/docs/guides/guides.module'
                            ).then((m) => m.GuidesModule),
                    },
                ],
            },

            // 404 & Catch all
            {
                path: '404-not-found',
                pathMatch: 'full',
                loadChildren: () =>
                    import(
                        'app/modules/admin/pages/error/error-404/error-404.module'
                    ).then((m) => m.Error404Module),
            },
            { path: '**', redirectTo: '404-not-found' },
        ],
    },
];
