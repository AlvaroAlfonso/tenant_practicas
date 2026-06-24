// src/modules/activity/application/get-activities-by-negocio.use-case.ts
import { ActivityRepository } from '../domain/activity-repository.interface.js';
import { Activity } from '../domain/activity.entity.js';

/**
 * Caso de Uso: Listar Historial de la Bitácora.
 * Garantiza la extracción cronológica de interacciones bajo aislamiento del tenant.
 */
export class GetActivitiesByNegocioUseCase {
  constructor(private activityRepository: ActivityRepository) {}

  async execute(negocioId: string, tenantId: string): Promise<Activity[]> {
    if (!negocioId) {
      throw new Error('Se requiere el ID del negocio para consultar su línea de tiempo.');
    }
    if (!tenantId) {
      throw new Error('Operación denegada: Falta el identificador de seguridad de la empresa.');
    }

    return await this.activityRepository.findByNegocioId(negocioId, tenantId);
  }
}