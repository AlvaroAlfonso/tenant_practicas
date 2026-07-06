//frontend/src/app/modules/dashboard/pages/dashboard-home/dashboard-home.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { HttpHeaders } from '@angular/common/http';

import { CustomerService } from '../../services/customer.service.js';

export interface Customer {
  id: string;
  nitRut: string;
  razonSocial: string;
  tenantId?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [
    CommonModule, 
    ChartModule, 
    ReactiveFormsModule,
    Dialog,
    Button,
    InputText
  ],
  templateUrl: './dashboard-home.html',
  styleUrls: ['./dashboard-home.css']
})
export class DashboardHomeComponent implements OnInit {
  private customerService = inject(CustomerService);
  private fb = inject(FormBuilder);

  public customers: Customer[] = [];
  public isLoading: boolean = true;
  public errorMessage: string = '';
  public displayModal: boolean = false;
  public customerForm!: FormGroup;
  public isSaving: boolean = false;

  ngOnInit(): void {
    this.cargarClientes();
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.customerForm = this.fb.group({
      nitRut: ['', [Validators.required, Validators.minLength(5)]],
      razonSocial: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  // Generamos opciones de cabecera seguras con el token JWT guardado en el Login
  private obtenerHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

cargarClientes(): void {
    this.isLoading = true;
    const options = this.obtenerHeaders();

    // 💡 Enviamos las opciones con el token al servicio externo
    this.customerService.getCustomers(options).subscribe({
      next: (clientesMapeados: any[]) => {
        // 🕵️‍♂️ LOG DE AUDITORÍA
        console.log('📥 [ANGULAR DASHBOARD] Clientes recibidos del servicio:', clientesMapeados);
        
        // Como el servicio ya usó .pipe(map()), 'clientesMapeados' es el arreglo directo de objetos
        this.customers = clientesMapeados || [];
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error al recuperar los clientes del CRM:', err);
        this.errorMessage = 'No se pudieron cargar las empresas clientes de la organización (Verifica tu sesión).';
        this.isLoading = false;
      }
    });
  }

  abrirModal(): void {
    this.customerForm.reset();
    this.displayModal = true;
  }

  cerrarModal(): void {
    this.displayModal = false;
  }

  guardarCliente(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const formValues = this.customerForm.value;
    const options = this.obtenerHeaders();

    const payload = {
      nitRut: formValues.nitRut,
      razonSocial: formValues.razonSocial
    };

    // 💡 Inyectamos el payload junto a las opciones de autenticación
    this.customerService.createCustomer(payload, options).subscribe({
      next: (res) => {
        console.log('✅ [CRM]: Empresa cliente registrada con éxito:', res);
        this.cargarClientes();
        this.cerrarModal();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('❌ [CRM]: Error al registrar el cliente:', err);
        alert(err.error?.message || 'Error interno al registrar la empresa cliente.');
        this.isSaving = false;
      }
    });
  }
}