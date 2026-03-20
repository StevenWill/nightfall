import { ApplicationConfig, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Material from '@primeng/themes/material';
import { ConfigService } from '@nightfall/shared/util';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const configService = inject(ConfigService);
        return () => configService.load();
      },
      multi: true,
    },
    providePrimeNG({
      theme: {
        preset: Material,
        options: {
          darkModeSelector: false,
        },
      },
    }),
  ],
};
