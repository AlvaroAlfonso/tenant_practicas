// backend/src/modules/auth/infrastructure/pg-user.repository.ts
import { UserRepository } from '../domain/user-repository.interface.js';
import { User } from '../domain/user.entity.js';
import { pool } from '../../../shared/infrastructure/database.js';

export class PgUserRepository implements UserRepository {
  
  async findByEmail(email: string): Promise<User | null> {
    // IMPORTANTE: "rol" con comillas dobles para que Postgres no use el rol del sistema Lenovo
    const query = `
      SELECT id, username, nombre, email, password_hash, tenant_id, "rol", activo, created_at
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

  async save(user: User): Promise<User> {
    const query = `
      INSERT INTO usuario (id, username, nombre, email, password_hash, tenant_id, "rol", activo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, nombre, email, password_hash AS "passwordHash", tenant_id AS "tenantId", "rol", activo, created_at AS "createdAt";
    `;

    const values = [
      user.id,
      user.username,
      user.nombre,
      user.email,
      user.passwordHash,
      user.tenantId,     
      user.rol,          
      user.activo        
    ];

    const result = await pool.query(query, values);
    const row = result.rows[0];

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