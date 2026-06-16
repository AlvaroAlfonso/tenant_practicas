// src/modules/customer/application/delete-customer.use-case.ts
import { CustomerRepository } from '../domain/customer-repository.interface.js';

export class DeleteCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(id: string, tenantId: string): Promise<void> {
    const existe = await this.customerRepository.findById(id, tenantId);
    if (!existe) {
      throw new Error('No se puede eliminar: el cliente no existe o no pertenece a su empresa.');
    }

    const exito = await this.customerRepository.deleteLogical(id, tenantId);
    if (!exito) {
      throw new Error('No se pudo completar el borrado lógico del cliente.');
    }
  }
}