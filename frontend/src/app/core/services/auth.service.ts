// frontend/src/app/core/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginCredentials, AuthResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private readonly TOKEN_KEY = 'crm_saas_jwt_token';

  /**
   * Despacha las credenciales al backend y almacena el token si el acceso es válido.
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    // Transformamos la interfaz de UI al contrato exacto que espera tu Fastify Server
    const payload = {
      email: credentials.email,
      password: credentials.passwordHash
    };

    return this.http.post<AuthResponse>(`${this.API_URL}/login`, payload).pipe(
      tap(response => {
        if (response && response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  /**
   * Métodos de utilidad segura para la persistencia del Token JWT
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}