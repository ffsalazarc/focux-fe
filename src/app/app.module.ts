import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExtraOptions, PreloadAllModules, RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { FuseModule } from '@fuse';
import { FuseConfigModule } from '@fuse/services/config';
import { FuseMockApiModule } from '@fuse/lib/mock-api';
import { CoreModule } from 'app/core/core.module';
import { appConfig } from 'app/core/config/app.config';
import { mockApiServices } from 'app/mock-api';
import { LayoutModule } from 'app/layout/layout.module';
import { AppComponent } from 'app/app.component';
import { appRoutes } from 'app/app.routing';
import { MatDialogModule } from '@angular/material/dialog';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { GuardAuthGuard } from './core/guards/guard-auth.guard';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomMatPaginatorInt } from './paginate-es';
import { PipesModule } from './modules/admin/dashboards/assignment-occupation/pipes/pipes.module';
import { SharedModule } from './shared/shared.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorRequestInterceptor } from './core/interceptor/interceptor-request.interceptor';

registerLocaleData(localeEs);

const routerConfig: ExtraOptions = {
    preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled',
};

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes, routerConfig),

        // Fuse, FuseConfig & FuseMockAPI
        FuseModule,
        FuseConfigModule.forRoot(appConfig),
        FuseMockApiModule.forRoot(mockApiServices),

        // Core module of your application
        CoreModule,

        // Layout module of your application
        LayoutModule,

        // 3rd party modules that require global configuration via forRoot
        MarkdownModule.forRoot({}),

        MatDialogModule,

        //Pipes module
        PipesModule,
        SharedModule,
    ],
    bootstrap: [AppComponent],
    providers: [
        { provide: LOCALE_ID, useValue: 'es' },
        { provide: MatPaginatorIntl, useClass: CustomMatPaginatorInt },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: InterceptorRequestInterceptor,
            multi: true,
          }
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
    ]
})
export class AppModule {}
