import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, UrlSerializer } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BannerComponent } from './banner/banner.component';
import { ErrorComponent } from './error/error.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { MenuComponent } from './header/menu/menu.component';
import { CustomErrorInterceptor } from './utils/custom-error-interceptor';
import { CustomTranslateLoaderService } from './utils/custom-translate-loader.service';
import { CustomUrlSerializer } from './utils/custom-url-serializer';
import { SharedModule } from './utils/shared.module';
import { registerLocaleData } from '@angular/common';
import localeEn from '@angular/common/locales/en';
registerLocaleData(localeEn);

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    MenuComponent,
    ErrorComponent,
    BannerComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    AppRoutingModule,
    HttpClientModule,
    SharedModule,
    TranslateModule.forRoot({
      loader: { provide: TranslateLoader, useClass: CustomTranslateLoaderService }
    }),

    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    DeviceDetectorModule.forRoot(),
    RouterModule
  ],
  providers: [
    { provide: UrlSerializer, useClass: CustomUrlSerializer },
    { provide: HTTP_INTERCEPTORS, useClass: CustomErrorInterceptor, multi: true },
    { provide: LOCALE_ID, useValue: 'en-US' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
