// frontend/src/app/core/components/dashboard/dashboard.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-slate-800">Bienvenido al Panel de Control Multitenant</h1>
      <p class="text-slate-600 mb-4">Métricas y tubería de ventas de Active Process SAS en desarrollo...</p>
      <button pButton label="Cerrar Sesión" icon="pi pi-power-off" class="p-button-danger" (click)="logout()"></button>
    </div>
  `
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}