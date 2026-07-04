// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./core/components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register-tenant',
    loadComponent: () => import('./modules/auth/pages/register-tenant/register-tenant.component').then(m => m.RegisterTenantComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/pages/dashboard-home/dashboard-home').then(m => m.DashboardHomeComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full' // ¡Corregido! Antes decía matchPath y causaba error TS2353
  },
  {
    path: '**',
    redirectTo: 'login' // Comodín de seguridad ante rutas inexistentes
  }
];