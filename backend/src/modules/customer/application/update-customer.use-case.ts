// src/modules/customer/application/update-customer.use-case.ts
import { CustomerRepository } from '../domain/customer-repository.interface.js';
import { Customer } from '../domain/customer.entity.js';

interface UpdateCustomerInput {
  id: string;
  tenantId: string;
  nombre: string;
  empresa: string;
  correo: string;
  telefono: string;
}

export class UpdateCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(input: UpdateCustomerInput): Promise<Customer> {
    // 1. Validar la existencia previa y el aislamiento
    const existe = await this.customerRepository.findById(input.id, input.tenantId);
    if (!existe) {
      throw new Error('No se puede actualizar: el cliente no existe o no pertenece a su empresa.');
    }

    // 2. Crear la entidad con los datos nuevos manteniendo los datos de auditoría previos
    const clienteActualizado = new Customer(
      input.id,
      input.tenantId,
      input.nombre,
      input.empresa,
      input.correo,
      input.telefono,
      existe.createdAt
    );

    // 3. Persistir los cambios
    return await this.customerRepository.update(clienteActualizado);
  }
}