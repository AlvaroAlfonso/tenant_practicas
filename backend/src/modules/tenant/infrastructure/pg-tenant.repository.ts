// src/modules/tenant/infrastructure/pg-tenant.repository.ts
import { pool } from '../../../shared/infrastructure/database.js';
import { TenantRepository } from '../domain/tenant-repository.interface.js';
import { Tenant } from '../domain/tenant.entity.js';

/**
 * Adaptador de Salida: Repositorio PostgreSQL.
 * Acoplado perfectamente a la estructura real de la tabla 'tenant'.
 */
export class PgTenantRepository implements TenantRepository {
  
  async findById(id: string): Promise<Tenant | null> {
    // Usamos alias SQL (AS) para transformar tus columnas físicas a las propiedades del dominio
    const query = `
      SELECT 
        id, 
        nombre_comercial AS nombre, 
        rfc_nit AS ruc, 
        (estado = 'activo') AS activo, 
        created_at AS creado_en 
      FROM tenant 
      WHERE id = $1;
    `;
    const values = [id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    // Construimos la entidad de dominio con los datos mapeados
    return new Tenant(
      row.id,
      row.nombre,
      row.ruc,
      row.activo,
      row.creado_en
    );
  }

  async create(tenant: Tenant): Promise<Tenant> {
    // Ajustamos el INSERT para que coincida con tus columnas reales
    const query = `
      INSERT INTO tenant (id, nombre_comercial, rfc_nit, estado)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre_comercial AS nombre, rfc_nit AS ruc, (estado = 'activo') AS activo, created_at AS creado_en;
    `;
    // Al crear uno nuevo, guardamos 'activo' como el texto 'activo' en la columna estado
    const estadoTexto = tenant.activo ? 'activo' : 'inactivo';
    const values = [tenant.id, tenant.nombre, tenant.ruc, estadoTexto];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    return new Tenant(row.id, row.nombre, row.ruc, row.activo, row.creado_en);
  }
}