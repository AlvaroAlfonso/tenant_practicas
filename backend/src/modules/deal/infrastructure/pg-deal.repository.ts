// src/modules/deal/infrastructure/pg-deal.repository.ts
import { pool } from '../../../shared/infrastructure/database.js';
import { DealRepository } from '../domain/deal-repository.interface.js';
import { Deal } from '../domain/deal.entity.js';

export class PgDealRepository implements DealRepository {

  // =======================================================================
  // PERSISTIR UN NUEVO NEGOCIO (INSERT)
  // =======================================================================
  async create(deal: Deal): Promise<Deal> {
    const query = `
      INSERT INTO negocio (id, tenant_id, cliente_id, titulo, valor, etapa, fecha_cierre_estimada)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, tenant_id AS "tenantId", cliente_id AS "clienteId", titulo, valor, etapa, fecha_cierre_estimada AS "fechaCierreEstimada", created_at AS "createdAt";
    `;
    const values = [
      deal.id,
      deal.tenantId,
      deal.clienteId,
      deal.titulo,
      deal.valor,
      deal.etapa,
      deal.fechaCierreEstimada
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    return new Deal(
      row.id,
      row.tenantId,
      row.clienteId,
      row.titulo,
      row.valor ? Number(row.valor) : null,
      row.etapa,
      row.fechaCierreEstimada ? new Date(row.fechaCierreEstimada) : null,
      row.createdAt
    );
  }

  // =======================================================================
  // RECUPERAR TODO EL PIPELINE DE LA EMPRESA (SELECT MULTI-TENANT)
  // =======================================================================
  async findByTenant(tenantId: string): Promise<Deal[]> {
    const query = `
      SELECT id, tenant_id AS "tenantId", cliente_id AS "clienteId", titulo, valor, etapa, fecha_cierre_estimada AS "fechaCierreEstimada", created_at AS "createdAt"
      FROM negocio
      WHERE tenant_id = $1
      ORDER BY created_at DESC;
    `;
    
    const result = await pool.query(query, [tenantId]);

    return result.rows.map(row => new Deal(
      row.id,
      row.tenantId,
      row.clienteId,
      row.titulo,
      row.valor ? Number(row.valor) : null,
      row.etapa,
      row.fechaCierreEstimada ? new Date(row.fechaCierreEstimada) : null,
      row.createdAt
    ));
  }

  // =======================================================================
  // ACTUALIZAR ETAPA EN EL TABLERO KANBAN (UPDATE CON ESCUDO DE TENANT)
  // =======================================================================
  async updateStage(id: string, tenantId: string, nuevaEtapa: string): Promise<boolean> {
    const query = `
      UPDATE negocio
      SET etapa = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND tenant_id = $3;
    `;
    const values = [nuevaEtapa, id, tenantId];

    const result = await pool.query(query, values);
    
    // Si rowCount es mayor a 0, significa que el negocio existía y pertenecía al tenant
    return (result.rowCount ?? 0) > 0;
  }
}