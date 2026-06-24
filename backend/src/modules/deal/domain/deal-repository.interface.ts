// src/modules/deal/domain/deal-repository.interface.ts
import { Deal } from './deal.entity.js';

/**
 * Contrato del Dominio: Interfaz para la persistencia de Negocios (Deals).
 * Define las operaciones obligatorias con aislamiento estricto de Tenant.
 */
export interface DealRepository {
  /**
   * Registra un nuevo negocio en el pipeline.
   */
  create(deal: Deal): Promise<Deal>;

  /**
   * Recupera todos los negocios pertenecientes a un Tenant específico.
   */
  findByTenant(tenantId: string): Promise<Deal[]>;

  /**
   * Actualiza únicamente la etapa (columna Kanban) de un negocio específico.
   * Valida internamente la pertenencia al tenant por seguridad.
   */
  updateStage(id: string, tenantId: string, nuevaEtapa: string): Promise<boolean>;
}