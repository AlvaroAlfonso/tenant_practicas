// src/app/modules/auth/pages/register-tenant/register-tenant.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service.js';

@Component({
  selector: 'app-register-tenant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-tenant.component.html'
})
export class RegisterTenantComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    nombreComercial: ['', [Validators.required, Validators.minLength(3)]],
    rfcNit: ['', [Validators.required, Validators.pattern(/^[0-9\-]+$/)]], // Solo números y guiones
    emailPrincipal: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
    nombreAdmin: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSubmitting = false;

  onSubmit(): void {
    if (this.registerForm.invalid) return

    this.isSubmitting = true;
    this.errorMessage = '';

    // Mapeo limpio hacia el DTO que espera tu controlador de Fastify
    const payload = {
      nombreComercial: this.registerForm.value.nombreEmpresa, // Convierte de UI a API
      rfcNit: this.registerForm.value.rfcNit,
      emailPrincipal: this.registerForm.value.emailPrincipal,
      username: this.registerForm.value.username,
      nombreAdmin: this.registerForm.value.nombreAdmin,
      passwordPlana: this.registerForm.value.password
    };

    this.authService.registerTenant(payload).subscribe({
      next: (response) => {
      this.successMessage = '¡Empresa y cuenta administrativa configuradas con éxito! Redirigiendo al login...';
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 3000);
    },
    error: (err) => {
      this.isSubmitting = false;
      this.errorMessage = err.error?.message || 'Error crítico de red al procesar el registro de la organización.';
    }
    });
  }
}