// frontend/src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Importación de tu interceptor funcional
import { authInterceptor } from './core/interceptors/auth.interceptor';

// Importaciones modernas para PrimeNG v19+
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura'; 



export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Configuración automática del tema moderno
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false // Desactiva modo oscuro automático para mantener la estética limpia
        }
      }
    })
  ]
};



