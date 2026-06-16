// src/modules/customer/infrastructure/pg-customer.repository.ts
import { pool } from '../../../shared/infrastructure/database.js';
import { CustomerRepository } from '../domain/customer-repository.interface.js';
import { Customer } from '../domain/customer.entity.js';

/**
 * Adaptador de Salida: Repositorio PostgreSQL para Clientes.
 * Implementa el CRUD completo con aislamiento multi-tenant estricto.
 */
export class PgCustomerRepository implements CustomerRepository {

  async create(customer: Customer): Promise<Customer> {
    const query = `
      INSERT INTO cliente (id, tenant_id, nombre, empresa, correo, telefono)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, tenant_id AS "tenantId", nombre, empresa, correo, telefono, created_at AS "createdAt";
    `;
    const values = [customer.id, customer.tenantId, customer.nombre, customer.empresa, customer.correo, customer.telefono];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    return new Customer(row.id, row.tenantId, row.nombre, row.empresa, row.correo, row.telefono, row.createdAt);
  }

  async findByTenant(tenantId: string): Promise<Customer[]> {
    // Solo traemos los clientes cuyo tenant_id coincida y no hayan sido desvinculados (tenant_id no nulo)
    const query = `
      SELECT id, tenant_id AS "tenantId", nombre, empresa, correo, telefono, created_at AS "createdAt"
      FROM cliente
      WHERE tenant_id = $1
      ORDER BY created_at DESC;
    `;
    const values = [tenantId];

    const result = await pool.query(query, values);

    return result.rows.map(row => new Customer(
      row.id,
      row.tenantId,
      row.nombre,
      row.empresa,
      row.correo,
      row.telefono,
      row.createdAt
    ));
  }

  async findById(id: string, tenantId: string): Promise<Customer | null> {
    // Doble validación de seguridad: por ID del cliente y por ID del Tenant
    const query = `
      SELECT id, tenant_id AS "tenantId", nombre, empresa, correo, telefono, created_at AS "createdAt"
      FROM cliente
      WHERE id = $1 AND tenant_id = $2;
    `;
    const values = [id, tenantId];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return new Customer(row.id, row.tenantId, row.nombre, row.empresa, row.correo, row.telefono, row.createdAt);
  }

  async update(customer: Customer): Promise<Customer> {
    const query = `
      UPDATE cliente
      SET nombre = $1, empresa = $2, correo = $3, telefono = $4
      WHERE id = $5 AND tenant_id = $6
      RETURNING id, tenant_id AS "tenantId", nombre, empresa, correo, telefono, created_at AS "createdAt";
    `;
    const values = [customer.nombre, customer.empresa, customer.correo, customer.telefono, customer.id, customer.tenantId];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    return new Customer(row.id, row.tenantId, row.nombre, row.empresa, row.correo, row.telefono, row.createdAt);
  }

  async deleteLogical(id: string, tenantId: string): Promise<boolean> {
    // BORRADO LÓGICO INDUSTRIAL: En lugar de hacer un DELETE físico que rompa el histórico, 
    // seteamos el correo con un prefijo '[ELIMINADO]' y desvinculamos el tenant_id activo 
    // pasándolo a NULL (o un id histórico), de modo que desaparece del tenant actual pero el registro físico queda para analítica.
    const query = `
      UPDATE cliente
      SET tenant_id = NULL, correo = CONCAT('[ELIMINADO]-', correo)
      WHERE id = $1 AND tenant_id = $2;
    `;
    const values = [id, tenantId];
    const result = await pool.query(query, values);
    
    return (result.rowCount ?? 0) > 0;
  }
}