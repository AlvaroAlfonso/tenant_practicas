// src/modules/activity/domain/activity-repository.interface.ts
import { Activity } from './activity.entity.js';

/**
 * Contrato del Dominio: Interfaz para la persistencia de Actividades.
 * Define las operaciones permitidas para la bitácora bajo aislamiento estricto.
 */
export interface ActivityRepository {
  /**
   * Registra una nueva interacción (Llamada, Correo, etc.) en el sistema.
   * @param activity Entidad con los datos de la interacción.
   */
  create(activity: Activity): Promise<Activity>;

  /**
   * Recupera el historial completo de interacciones de un negocio específico,
   * validando que pertenezca al inquilino (Tenant) para evitar fugas de información.
   * @param negocioId ID del negocio del cual se quiere ver la línea de tiempo.
   * @param tenantId ID del tenant que realiza la consulta para verificar pertenencia.
   */
  findByNegocioId(negocioId: string, tenantId: string): Promise<Activity[]>;
}