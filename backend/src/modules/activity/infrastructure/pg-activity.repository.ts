// src/modules/activity/infrastructure/pg-activity.repository.ts
import { pool } from '../../../shared/infrastructure/database.js';
import { ActivityRepository } from '../domain/activity-repository.interface.js';
import { Activity } from '../domain/activity.entity.js';

/**
 * Adaptador de Salida: Repositorio PostgreSQL para Actividades.
 * Conecta el dominio con la tabla física 'actividad' asegurando el aislamiento corporativo.
 */
export class PgActivityRepository implements ActivityRepository {
  
  // =======================================================================
  // PERSISTIR UNA NUEVA ACTIVIDAD (INSERT MULTI-TENANT)
  // =======================================================================
  async create(activity: Activity): Promise<Activity> {
    // Usamos una inserción basada en un SELECT para heredar automáticamente el tenant_id real del negocio
    const query = `
      INSERT INTO actividad (id, tenant_id, negocio_id, tipo, descripcion, fecha_programada, estado)
      SELECT 
        $1::uuid, 
        n.tenant_id, 
        $2::uuid, 
        $3, 
        $4, 
        $5::timestamp, 
        $6
      FROM negocio n
      WHERE n.id = $2::uuid
      RETURNING id, tenant_id AS "tenantId", negocio_id AS "negocioId", tipo, descripcion, fecha_programada AS "fechaProgramada", estado;
    `;
    
    const values = [
      activity.id,
      activity.negocioId,
      activity.tipo,
      activity.descripcion,
      activity.fechaProgramada || new Date(), // Evita nulos en la fecha si viene vacía
      'realizada'                             // Estado de interacción para la bitácora
    ];

    const result = await pool.query(query, values);
    
    // Si por alguna razón el negocio_id no existe en la BD, el SELECT no insertará nada
    if (result.rowCount === 0) {
      throw new Error(`No se pudo registrar la actividad. Compruebe que el negocio_id ${activity.negocioId} existe.`);
    }

    const row = result.rows[0];
    return new Activity(row.id, row.tipo, row.descripcion, row.fechaProgramada, row.negocioId);
  }

  // =======================================================================
  // RECUPERAR LÍNEA DE TIEMPO DEL NEGOCIO (SELECT BLINDADO POR TENANT)
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

    return result.rows.map(row => new Activity(
      row.id,
      row.tipo,
      row.descripcion,
      row.fechaProgramada,
      row.negocioId
    ));
  }
}