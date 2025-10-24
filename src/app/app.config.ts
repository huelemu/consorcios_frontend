import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { 
  SocialAuthServiceConfig, 
  GoogleLoginProvider 
} from '@abacritt/angularx-social-login';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider('214922698115-lsq51vuo1k32l9nknl96nu6bccrlfb48.apps.googleusercontent.com'),
          },
        ],
        onError: (err: any) => {
          console.error('Error en Social Auth:', err);
        }
      } as SocialAuthServiceConfig,
    },
  ],
};