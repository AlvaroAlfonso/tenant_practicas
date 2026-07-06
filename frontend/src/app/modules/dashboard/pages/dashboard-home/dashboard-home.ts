//frontend/src/app/modules/dashboard/pages/dashboard-home/dashboard-home.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';

// 💡 Importaciones modernas de la suite de PrimeNG v19 para el formulario modal
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

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

  // Propiedades reactivas del estado
  public customers: Customer[] = [];
  public isLoading: boolean = true;
  public errorMessage: string = '';

  // 💡 Control del Modal de Registro
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

  cargarClientes(): void {
    this.isLoading = true;
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al recuperar los clientes del CRM:', err);
        this.errorMessage = 'No se pudieron cargar los clientes de la organización.';
        this.isLoading = false;
      }
    });
  }

  // Métodos de control del Modal
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

    // Respetamos estrictamente el tipo CreateCustomerInput exigido por tu servicio
    const payload = {
      nitRut: formValues.nitRut,
      razonSocial: formValues.razonSocial
    };

    this.customerService.createCustomer(payload).subscribe({
      next: (res) => {
        console.log('✅ [CRM]: Cliente registrado con éxito:', res);
        this.cargarClientes();
        this.cerrarModal();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('❌ [CRM]: Error al registrar el cliente:', err);
        alert(err.error?.message || 'Error interno al registrar el cliente corporativo.');
        this.isSaving = false;
      }
    });
  }
}