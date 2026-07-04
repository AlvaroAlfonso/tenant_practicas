// frontend/src/app/core/components/login/login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Importamos el servicio real
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, PasswordModule, ButtonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  isForgotPassword = false;
  recoveryForm!: FormGroup;
  recoverySuccessMessage = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService // Inyectamos el servicio de autenticación
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.recoveryForm = this.fb.group({
      recoveryEmail: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      // Consumimos el endpoint real POST /api/auth/login
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          // Guardamos las credenciales y el token JWT emitido
          this.authService.saveSession(res.token, res.user);
          
          console.log('🔓 [Auth]: Login exitoso contra PostgreSQL. Redirigiendo...');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          // Capturamos el mensaje de error estructurado que configuraste en tu backend
          this.errorMessage = err.error?.message || 'Error al iniciar sesión. Intente de nuevo.';
          console.error('❌ [Auth Error]:', err);
        }
      });
    }
  }

  toggleForgotPassword(show: boolean): void {
    this.isForgotPassword = show;
    this.errorMessage = '';
    this.recoverySuccessMessage = '';
    if (!show) {
      this.recoveryForm.reset();
    }
  }

  onSendRecoveryLink(): void {
    if (this.recoveryForm.valid) {
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
        this.recoverySuccessMessage = 'Si el correo existe en nuestro sistema multitenant, recibirá un enlace de restablecimiento en breve.';
      }, 1000);
    }
  }
}