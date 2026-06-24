// src/modules/customer/application/create-customer.use-case.ts
import { randomUUID } from 'crypto';
import { CustomerRepository } from '../domain/customer-repository.interface.js';
import { Customer } from '../domain/customer.entity.js';

// Estructura limpia que describe los datos necesarios para registrar un cliente nuevo
interface CreateCustomerInput {
  tenantId: string;
  nombre: string;
  empresa: string;
  correo: string;
  telefono: string;
}

/**
 * Caso de Uso: Crear Cliente Corporativo.
 * Inyecta un UUID automático y asegura el aislamiento del Tenant en la inserción.
 */
export class CreateCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(input: CreateCustomerInput): Promise<Customer> {
    const nuevoId = randomUUID(); // Generación del identificador único industrial

    const customer = new Customer(
      nuevoId,
      input.tenantId,
      input.nombre,
      input.empresa,
      input.correo,
      input.telefono
    );

    return await this.customerRepository.create(customer);
  }
}