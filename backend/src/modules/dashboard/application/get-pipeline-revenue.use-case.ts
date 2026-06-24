// src/modules/dashboard/application/get-pipeline-revenue.use-case.ts
import { DashboardMetricsRepository } from '../domain/dashboard-metrics.interface.js';
import { PipelineRevenueDTO } from '../domain/dashboard.types.js';

export class GetPipelineRevenueUseCase {
  constructor(private metricsRepository: DashboardMetricsRepository) {}

  async execute(tenantId: string): Promise<PipelineRevenueDTO[]> {
    if (!tenantId) {
      throw new Error('El identificador corporativo (tenantId) es requerido para extraer métricas.');
    }
    return await this.metricsRepository.getPipelineRevenue(tenantId);
  }
}