// src/modules/activity/infrastructure/pg-activity.repository.ts
import { pool } from '../../../shared/infrastructure/database.js';
import { ActivityRepository } from '../domain/activity-repository.interface.js';
import { Activity } from '../domain/activity.entity.js';

/**
 * Adaptador de Salida: Repositorio PostgreSQL para Actividades.
 * Conecta el dominio con la tabla física 'actividad' bajo aislamiento relacional.
 */
export class PgActivityRepository implements ActivityRepository {
  
  // =======================================================================
  // PERSISTIR UNA NUEVA ACTIVIDAD (INSERT)
  // =======================================================================
  async create(activity: Activity): Promise<Activity> {
    const query = `
      INSERT INTO actividad (id, tipo, descripcion, fecha_programada, negocio_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, tipo, descripcion, fecha_programada AS "fechaProgramada", negocio_id AS "negocioId";
    `;
    const values = [
      activity.id,
      activity.tipo,
      activity.descripcion,
      activity.fechaProgramada,
      activity.negocioId
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    // Mapeamos el registro de la BD de vuelta a nuestra Entidad de Dominio limpia
    return new Activity(row.id, row.tipo, row.descripcion, row.fechaProgramada, row.negocioId);
  }

  // =======================================================================
  // RECUPERAR LÍNEA DE TIEMPO DEL NEGOCIO (SELECT WITH INNER JOIN MULTI-TENANT)
  // =======================================================================
  async findByNegocioId(negocioId: string, tenantId: string): Promise<Activity[]> {
    const query = `
      SELECT a.id, a.tipo, a.descripcion, a.fecha_programada AS "fechaProgramada", a.negocio_id AS "negocioId"
      FROM actividad a
      INNER JOIN negocio n ON a.negocio_id = n.id
      WHERE a.negocio_id = $1 AND n.tenant_id = $2
      ORDER BY a.fecha_programada DESC;
    `;
    const values = [negocioId, tenantId];

    const result = await pool.query(query, values);

    // Transformamos cada fila de la tabla en una instancia de la entidad Activity
    return result.rows.map(row => new Activity(
      row.id,
      row.tipo,
      row.descripcion,
      row.fechaProgramada,
      row.negocioId
    ));
  }
}