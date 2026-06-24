// src/modules/dashboard/application/get-tasks-efficiency.use-case.ts
import { DashboardMetricsRepository } from '../domain/dashboard-metrics.interface.js';
import { TasksEfficiencyDTO } from '../domain/dashboard.types.js';

export class GetTasksEfficiencyUseCase {
  constructor(private metricsRepository: DashboardMetricsRepository) {}

  async execute(tenantId: string): Promise<TasksEfficiencyDTO> {
    if (!tenantId) {
      throw new Error('El identificador corporativo (tenantId) es requerido para extraer métricas.');
    }
    return await this.metricsRepository.getTasksEfficiency(tenantId);
  }
}