import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    return true; // Acceso autorizado
  }

  // Intento de hackeo o acceso no autenticado: Redirección forzada
  router.navigate(['/auth/login']);
  return false;
};