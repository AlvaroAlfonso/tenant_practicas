// frontend/src/app/core/components/login/login.component.ts
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms'; // <-- Agregamos FormsModule
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, // <-- Importante para el campo de recuperación [(ngModel)]
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CardModule
  ],
  templateUrl: './login.component.html',
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Estados de control del Flujo de UI
  isForgotPassword = false;
  recoveryEmail = '';
  recoverySuccessMessage = '';

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';

  toggleForgotPassword(state: boolean): void {
    this.isForgotPassword = state;
    this.errorMessage = '';
    this.recoverySuccessMessage = '';
    this.recoveryEmail = '';
  }

  onSendRecoveryLink(): void {
    if (!this.recoveryEmail) return;
    this.isLoading = true;
    
    // Simulación del proceso Backend/Infraestructura para recuperación de credenciales corporativas
    setTimeout(() => {
      this.isLoading = false;
      this.recoverySuccessMessage = 'Si el correo existe en nuestro sistema multitenant, recibirá un enlace de restablecimiento en breve.';
    }, 1500);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';
    const { email, password } = this.loginForm.getRawValue();

    this.authService.login({ email, passwordHash: password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('¡Inicio de sesión exitoso con Token!', response);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Credenciales inválidas o servidor desconectado.';
      }
    });
  }
}