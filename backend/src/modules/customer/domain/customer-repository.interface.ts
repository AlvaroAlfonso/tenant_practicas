// backend/src/modules/customers/domain/customer-repository.interface.ts
import { Customer } from './customer.entity.js';

/**
 * Puerto de Salida: Interfaz del Repositorio de Clientes.
 * Define las operaciones transaccionales permitidas bajo aislamiento multi-tenant.
 */
export interface CustomerRepository {
  // Guarda un nuevo cliente vinculado a su respectivo Tenant
  create(customer: Customer): Promise<Customer>;
  
  // Lista ÚNICAMENTE los clientes que le pertenecen al Tenant logueado
  findByTenant(tenantId: string): Promise<Customer[]>;

  // Obtiene un cliente específico validando su pertenencia al Tenant
  findById(id: string, tenantId: string): Promise<Customer | null>;

  // Actualiza los datos de un cliente existente
  update(customer: Customer): Promise<Customer>;

  // Realiza un borrado lógico en la base de datos (Flag o desvinculación)
  deleteLogical(id: string, tenantId: string): Promise<boolean>;
}