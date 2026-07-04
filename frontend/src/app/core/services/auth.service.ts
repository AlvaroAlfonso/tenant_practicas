// frontend/src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Ajusta el puerto según el entorno donde corra tu Fastify (ej: http://localhost:3000)
  private apiUrl = 'http://localhost:3000/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Realiza la petición HTTP POST real al backend de Fastify
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  /**
   * Guarda de forma segura el token JWT en el navegador
   */
  saveSession(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Soluciona Error en auth.interceptor.ts:
   * Recupera el token guardado para las cabeceras de Fastify
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Soluciona Error en dashboard.component.ts:
   * Limpia el almacenamiento de la sesión corporativa y redirige al login
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🔒 [Auth]: Sesión destruida con éxito. Redirigiendo al Login...');
    this.router.navigate(['/login']);
  }
}