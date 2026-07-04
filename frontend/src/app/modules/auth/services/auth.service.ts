import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/auth';

  // Flujo 1: Login existente acoplado al backend
  login(credentials: { email: string; password_hash: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      })
    );
  }

  // Flujo 2: Registro del Tenant y su Administrador Inicial (Tu nuevo requerimiento)
  registerTenant(data: { 
    nombreComercial: string; 
    rfcNit: string; 
    emailPrincipal: string; 
    username: string; 
    nombreAdmin: string; 
    passwordPlana: string; 
  }): Observable<any> {
  return this.http.post('http://localhost:3000/api/auth/register-tenant', data);
}

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
}