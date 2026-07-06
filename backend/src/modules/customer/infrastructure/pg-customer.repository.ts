import { pool } from '../../../shared/infrastructure/database.js';
import { CustomerRepository } from '../domain/customer-repository.interface.js';
import { Customer } from '../domain/customer.entity.js';

/**
 * Adaptador de Salida: Repositorio PostgreSQL para Empresas Clientes.
 * Garantiza la persistencia limpia y aislada por ID de Tenant.
 */
export class PgCustomerRepository implements CustomerRepository {

  async create(customer: Customer): Promise<any> {
    const query = `
      INSERT INTO empresa_cliente (id, tenant_id, nit_rut, razon_social)
      VALUES ($1, $2, $3, $4)
      RETURNING id, tenant_id AS "tenantId", nit_rut AS "nitRut", razon_social AS "razonSocial", created_at AS "createdAt";
    `;
    // 💡 Leemos las variables exactas de la entidad de dominio corregida
    const values = [customer.id, customer.tenantId, customer.nitRut, customer.razonSocial];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findByTenant(tenantId: string): Promise<any[]> {
    const query = `
      SELECT 
        id, 
        tenant_id AS "tenantId", 
        nit_rut AS "nitRut", 
        razon_social AS "razonSocial", 
        created_at AS "createdAt"
      FROM empresa_cliente
      WHERE tenant_id = $1
      ORDER BY created_at DESC;
    `;
    const values = [tenantId];
    const result = await pool.query(query, values);

    return result.rows;
  }

  async findById(id: string, tenantId: string): Promise<any | null> {
    const query = `
      SELECT id, tenant_id AS "tenantId", nit_rut AS "nitRut", razon_social AS "razonSocial", created_at AS "createdAt"
      FROM empresa_cliente
      WHERE id = $1 AND tenant_id = $2;
    `;
    const values = [id, tenantId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  async update(customer: Customer): Promise<any> {
    const query = `
      UPDATE empresa_cliente
      SET nit_rut = $1, razon_social = $2
      WHERE id = $3 AND tenant_id = $4
      RETURNING id, tenant_id AS "tenantId", nit_rut AS "nitRut", razon_social AS "razonSocial", created_at AS "createdAt";
    `;
    // 💡 Leemos las variables exactas alineadas
    const values = [customer.nitRut, customer.razonSocial, customer.id, customer.tenantId];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async deleteLogical(id: string, tenantId: string): Promise<boolean> {
    const query = `
      DELETE FROM empresa_cliente
      WHERE id = $1 AND tenant_id = $2;
    `;
    const values = [id, tenantId];
    const result = await pool.query(query, values);
    
    return (result.rowCount ?? 0) > 0;
  }
}