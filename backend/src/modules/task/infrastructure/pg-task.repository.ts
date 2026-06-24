// src/modules/task/infrastructure/pg-task.repository.ts
import { pool } from '../../../shared/infrastructure/database.js';
import { TaskRepository } from '../domain/task-repository.interface.js';
import { Task } from '../domain/task.entity.js';

/**
 * Adaptador de Salida: Repositorio PostgreSQL mapeado a la tabla optimizada 'actividad'.
 * Almacena de forma nativa el aislamiento multi-tenant y el estado de la agenda.
 */
export class PgTaskRepository implements TaskRepository {
  
  async create(task: Task): Promise<Task> {
    const query = `
      INSERT INTO actividad (id, tenant_id, negocio_id, tipo, descripcion, fecha_programada, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, tenant_id AS "tenantId", negocio_id AS "negocioId", tipo AS "titulo", descripcion, fecha_programada AS "fechaVencimiento", estado;
    `;
    
    const values = [
      task.id,
      task.tenantId,        // Ahora sí se envía correctamente el identificador corporativo
      task.negocioId,       // Permite nulos si es una tarea general
      task.titulo,          // Entra a la columna física 'tipo'
      task.descripcion,
      task.fechaVencimiento,// Entra a 'fecha_programada'
      task.estado           // Controla el estado real de la tarea
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    return new Task(
      row.id,
      row.tenantId,
      row.negocioId,
      row.titulo,
      row.descripcion,
      new Date(row.fechaVencimiento),
      row.estado
    );
  }

  async findByTenant(tenantId: string): Promise<Task[]> {
    const query = `
      SELECT id, tenant_id AS "tenantId", negocio_id AS "negocioId", tipo AS "titulo", descripcion, fecha_programada AS "fechaVencimiento", estado
      FROM actividad
      WHERE tenant_id = $1 AND estado NOT IN ('realizada')
      ORDER BY fecha_programada ASC;
    `;
    
    const result = await pool.query(query, [tenantId]);

    return result.rows.map(row => new Task(
      row.id,
      row.tenantId,
      row.negocioId,
      row.titulo,
      row.descripcion,
      row.fechaVencimiento ? new Date(row.fechaVencimiento) : new Date(),
      row.estado
    ));
  }

  async updateStatus(id: string, tenantId: string, nuevoEstado: string): Promise<boolean> {
    const query = `
      UPDATE actividad
      SET estado = $1
      WHERE id = $2 AND tenant_id = $3;
    `;
    const values = [nuevoEstado, id, tenantId];
    
    const result = await pool.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }
}