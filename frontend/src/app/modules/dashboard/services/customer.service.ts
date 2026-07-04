import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Customer } from '../models/customer.model.js';

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
  getCustomers(): Observable<Customer[]> {
    return this.http.get<{ message: string; count: number; customers: Customer[] }>(this.apiUrl).pipe(
      map(response => response.customers)
    );
  }

  /**
   * Registra una nueva empresa cliente en el CRM con el contrato alineado
   */
  createCustomer(customer: CreateCustomerInput): Observable<any> {
    return this.http.post<any>(this.apiUrl, customer);
  }

  /**
   * Elimina lógicamente un cliente del sistema
   */
  deleteCustomer(id: string): Observable<any> {
    return this.http.delete<any>(`${`${this.apiUrl}`}/${id}`);
  }
}