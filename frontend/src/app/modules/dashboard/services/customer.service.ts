//frontend/src/app/modules/dashboard/services/customer.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';


// 💡 Definimos el contrato exacto que exige el backend ajustado
export interface CreateCustomerInput {
  nitRut: string;
  razonSocial: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/customers';

  /**
   * Obtiene la lista de clientes B2B pertenecientes al Tenant logueado
   */
  getCustomers(): Observable<any[]> {
    return this.http.get<{ message: string; count: number; customers: any[] }>(this.apiUrl).pipe(
      map(response => response.customers)
    );
  }
 /**
   * Registra una nueva empresa cliente en el CRM con el contrato alineado
   */
  createCustomer(customer: CreateCustomerInput): Observable<any> {
    const payloadParaBackend = {
      empresa: customer.nitRut,       // Cumple con la validación del backend
      nombre: customer.razonSocial,   // Satisface "El nombre de la empresa cliente es obligatorio"
      correo: '',
      telefono: ''
    };
    return this.http.post<any>(this.apiUrl, payloadParaBackend);
  }
}