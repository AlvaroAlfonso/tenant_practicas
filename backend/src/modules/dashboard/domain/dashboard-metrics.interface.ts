// src/modules/dashboard/domain/dashboard-metrics.interface.ts
import { 
  PipelineRevenueDTO, 
  TasksEfficiencyDTO, 
  AdvisorActivitiesDTO 
} from './dashboard.types.js';

/**
 * Puerto de Salida (Driven Port).
 * Interfaz que define el contrato obligatorio para la extracción de analíticas 
 * corporativas blindadas bajo aislamiento Multi-Tenant.
 */
export interface DashboardMetricsRepository {
  
  /**
   * Obtiene la sumatoria financiera de los negocios agrupada por su etapa Kanban.
   * @param tenantId Identificador único de la empresa/inquilino.
   */
  getPipelineRevenue(tenantId: string): Promise<PipelineRevenueDTO[]>;

  /**
   * Calcula la eficiencia operativa del mes actual evaluando tareas completadas vs pendientes.
   * @param tenantId Identificador único de la empresa/inquilino.
   */
  getTasksEfficiency(tenantId: string): Promise<TasksEfficiencyDTO>;

  /**
   * Audita el volumen de interacciones comerciales segmentadas por canal y asesor.
   * @param tenantId Identificador único de la empresa/inquilino.
   */
  getAdvisorActivities(tenantId: string): Promise<AdvisorActivitiesDTO[]>;
}