// backend/src/modules/auth/application/register-tenant.use-case.ts
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { pool } from '../../../shared/infrastructure/database.js';


export interface RegisterTenantInput {
  nombreComercial: string;
  rfcNit: string;
  emailPrincipal: string;
  username: string;
  nombreAdmin: string;
  passwordPlana: string;
}

export class RegisterTenantUseCase {
  async execute(input: RegisterTenantInput): Promise<{ tenantId: string; userId: string }> {
    // 1. Obtener un plan de servicio por defecto para el tenant (Requerido por restricción FK)
    const planResult = await pool.query('SELECT id FROM plan_servicio WHERE activo = true LIMIT 1;');
    if (planResult.rows.length === 0) {
      throw new Error('Configuración del sistema inválida: No existen planes de servicio activos.');
    }
    const planServicioId = planResult.rows[0].id;

    // 2. Generar IDs y procesar datos antes de la transacción
    const tenantId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const dominioSlug = input.nombreComercial.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    const passwordHash = await bcrypt.hash(input.passwordPlana, 10);

    // 3. Iniciar Transacción Atómica
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // INSERT 1: Crear el Inquilino (Tenant)
      const tenantQuery = `
        INSERT INTO tenant (id, plan_servicio_id, nombre_comercial, dominio_slug, rfc_nit, email_principal, estado)
        VALUES ($1, $2, $3, $4, $5, $6, 'trial')
        RETURNING id;
      `;
      await client.query(tenantQuery, [
        tenantId,
        planServicioId,
        input.nombreComercial,
        dominioSlug,
        input.rfcNit,
        input.emailPrincipal
      ]);

      // INSERT 2: Crear el Usuario Administrador ligado a ese Tenant
      const userQuery = `
        INSERT INTO usuario (id, username, nombre, email, password_hash, tenant_id, "rol", activo)
        VALUES ($1, $2, $3, $4, $5, $6, 'administrador', true)
        RETURNING id;
      `;
      await client.query(userQuery, [
        userId,
        input.username,
        input.nombreAdmin,
        input.emailPrincipal, // Usamos el mismo correo corporativo para el login del admin
        passwordHash,
        tenantId
      ]);

      // Si todo sale bien, consolidamos los cambios en el disco duro
      await client.query('COMMIT');
      return { tenantId, userId };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}