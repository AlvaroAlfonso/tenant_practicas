// src/modules/dashboard/domain/dashboard.types.ts

export interface PipelineRevenueDTO {
  etapa: string;
  totalValor: number;
  cantidadNegocios: number;
}

export interface TasksEfficiencyDTO {
  mesActual: string;
  tareasCompletadas: number;
  tareasPendientes: number;
  totalTareas: number;
  porcentajeEficiencia: number;
}

export interface ActivityBreakdown {
  tipo: string;
  cantidad: number;
}

export interface AdvisorActivitiesDTO {
  usuarioId: string;
  nombreAsesor: string;
  interacciones: ActivityBreakdown[];
  totalGeneral: number;
}