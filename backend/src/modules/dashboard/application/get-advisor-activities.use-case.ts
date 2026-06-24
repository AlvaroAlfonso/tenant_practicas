// src/modules/dashboard/application/get-advisor-activities.use-case.ts
import { DashboardMetricsRepository } from '../domain/dashboard-metrics.interface.js';
import { AdvisorActivitiesDTO } from '../domain/dashboard.types.js';

export class GetAdvisorActivitiesUseCase {
  constructor(private metricsRepository: DashboardMetricsRepository) {}

  async execute(tenantId: string): Promise<AdvisorActivitiesDTO[]> {
    if (!tenantId) {
      throw new Error('El identificador corporativo (tenantId) es requerido para extraer métricas.');
    }
    return await this.metricsRepository.getAdvisorActivities(tenantId);
  }
}