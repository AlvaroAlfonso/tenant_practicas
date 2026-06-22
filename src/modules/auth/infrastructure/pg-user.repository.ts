import { UserRepository } from '../domain/user-repository.interface.js';
import { User } from '../domain/user.entity.js';
import { pool } from '../../../shared/infrastructure/database.js';

export class PgUserRepository implements UserRepository {
  
  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, username, nombre, email, password_hash, tenant_id, rol, activo, created_at
      FROM usuario
      WHERE email = $1 LIMIT 1;
    `;

    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];

    return {
      id: row.id,
      username: row.username,
      nombre: row.nombre,
      email: row.email,
      passwordHash: row.password_hash,
      tenantId: row.tenant_id,         
      rol: row.rol,
      activo: row.activo,
      createdAt: row.created_at,
    };
  }

  /**
   * Inserta físicamente un nuevo miembro del equipo en la tabla 'usuario'
   */
  async save(user: User): Promise<User> {
    const query = `
      INSERT INTO usuario (id, username, nombre, email, password_hash, tenant_id, rol, activo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, nombre, email, password_hash AS "passwordHash", tenant_id AS "tenantId", rol, activo, created_at AS "createdAt";
    `;

    const values = [
      user.id,
      user.username,
      user.nombre,
      user.email,
      user.passwordHash, // Mapea a password_hash
      user.tenantId,     // Mapea a tenant_id
      user.rol,          // Mapea a rol
      user.activo        // Mapea a activo (true)
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];

    // Devolvemos el objeto mapeado correctamente en CamelCase para el Dominio/Frontend
    return {
      id: row.id,
      username: row.username,
      nombre: row.nombre,
      email: row.email,
      passwordHash: row.passwordHash,
      tenantId: row.tenantId,
      rol: row.rol,
      activo: row.activo,
      createdAt: new Date(row.createdAt)
    };
  }
}