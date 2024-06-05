import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { MaterialsModule } from './materials/materials.module';
import { environment } from '../environments/environment';
import { JwtModule } from '@auth0/angular-jwt';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

export function tokenGetter() {
  return localStorage.getItem(environment.tokenName);
}


export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: tokenGetter,
          allowedDomains: [
            environment.apiUrl,
            environment.domain
          ],
          disallowedRoutes: [
            '/api/v1/signIn', '/api/v1/signUp'
          ],
        },
      }),
      MaterialsModule,
      BrowserAnimationsModule,
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    provideAnimations(),
    provideAnimationsAsync(),
  ]
};
