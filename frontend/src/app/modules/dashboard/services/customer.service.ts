//frontend/src/app/modules/dashboard/services/customer.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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
  getCustomers(options: { headers: HttpHeaders; }): Observable<any[]> {
    // 💡 IMPORTANTE: Pasamos las 'options' como segundo parámetro para enviar el Token JWT blindado
    return this.http.get<{ message: string; count: number; customers: any[] }>(this.apiUrl, options).pipe(
      map(response => response.customers)
    );
  }

  /**
   * Registra una nueva empresa cliente en el CRM con el contrato alineado
   */
  createCustomer(customer: CreateCustomerInput, options: { headers: HttpHeaders; }): Observable<any> {
    const payloadParaBackend = {
      empresa: customer.nitRut,       
      nombre: customer.razonSocial,   
      correo: '',
      telefono: ''
    };

    console.log('🚀 [FRONTEND SERVICE] Payload enviado:', payloadParaBackend);
    
    return this.http.post<any>(this.apiUrl, payloadParaBackend, options);
  }
}