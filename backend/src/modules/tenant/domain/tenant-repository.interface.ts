
import { Tenant } from './tenant.entity.js';

/**
 * Puerto de Salida: Interfaz del Repositorio de Tenants.
 * Define las operaciones permitidas para interactuar con la persistencia.
 */
export interface TenantRepository {
  findById(id: string): Promise<Tenant | null>;
  create(tenant: Tenant): Promise<Tenant>;
}