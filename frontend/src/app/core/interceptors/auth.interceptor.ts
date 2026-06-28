// frontend/src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor Funcional Avanzado.
 * Inspecciona y añade de forma transparente el token de seguridad a todas las peticiones salientes.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si el usuario ya está autenticado y tiene un token, clonamos la petición y le añadimos el Bearer
  if (token) {
    const secureReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(secureReq);
  }

  // Si no hay token, la petición continúa su curso normal (ej: la ruta de Login)
  return next(req);
};