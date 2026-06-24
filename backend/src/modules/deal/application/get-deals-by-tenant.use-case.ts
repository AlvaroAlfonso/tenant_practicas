// src/modules/deal/application/get-deals-by-tenant.use-case.ts
import { DealRepository } from '../domain/deal-repository.interface.js';
import { Deal } from '../domain/deal.entity.js';

/**
 * Caso de Uso: Recuperar Pipeline del Tablero Kanban
 * Extrae todos los negocios filtrados estrictamente por el ID de la empresa.
 */
export class GetDealsByTenantUseCase {
  constructor(private dealRepository: DealRepository) {}

  async execute(tenantId: string): Promise<Deal[]> {
    if (!tenantId) throw new Error('Operación denegada: No se proporcionó el identificador de la empresa.');
    return await this.dealRepository.findByTenant(tenantId);
  }
}