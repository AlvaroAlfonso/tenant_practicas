
import { UserRepository } from '../domain/user-repository.interface.js';
import { User } from '../domain/user.entity.js';
import { pool } from '../../../shared/infrastructure/database.js';

export class PgUserRepository implements UserRepository {
  
  async findByEmail(email: string): Promise<User | null> {
    // 1. Definimos la consulta SQL pura. 
    // Usamos el parámetro "$1" para aplicar consultas parametrizadas (Evita Inyección SQL).
    const query = `
      SELECT id, username, nombre, email, password_hash, tenant_id, rol, activo, created_at
      FROM usuario
      WHERE email = $1 LIMIT 1;
    `;

    // 2. Ejecutamos la consulta pasando el email de forma aislada y segura
    const result = await pool.query(query, [email]);

    // 3. Si la base de datos no devolvió ninguna fila, el usuario no existe
    if (result.rows.length === 0) {
      return null;
    }

    // 4. Tomamos el registro encontrado
    const row = result.rows[0];

    // 5. MAPEADOR (Mapper): Traducimos los nombres de snake_case (BD) a CamelCase (TypeScript)
    // Esto garantiza que el Frontend y el Dominio no se rompan por diferencias de nombres.
    return {
      id: row.id,
      username: row.username,
      nombre: row.nombre,
      email: row.email,
      passwordHash: row.password_hash, // <- Aquí unimos password_hash con passwordHash
      tenantId: row.tenant_id,         // <- Aquí unimos tenant_id con tenantId
      rol: row.rol,
      activo: row.activo,
      createdAt: row.created_at,
    };
  }
}