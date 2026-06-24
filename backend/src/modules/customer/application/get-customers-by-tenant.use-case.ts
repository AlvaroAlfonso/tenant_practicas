import { CustomerRepository } from '../domain/customer-repository.interface.js';
import { Customer } from '../domain/customer.entity.js';

/**
 * Caso de Uso: Listar Clientes por Empresa.
 * Aplica el filtro maestro para evitar fugas de información entre inquilinos.
 */
export class GetCustomersByTenantUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(tenantId: string): Promise<Customer[]> {
    if (!tenantId) {
      throw new Error('Se requiere un identificador de empresa válido para realizar la consulta.');
    }

    // Retorna la colección de clientes que pertenecen únicamente a este Tenant
    return await this.customerRepository.findByTenant(tenantId);
  }
}