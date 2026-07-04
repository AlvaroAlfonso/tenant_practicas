// backend/src/modules/customers/application/create-company-client.use-case.ts
import crypto from 'crypto';
import { pool } from '../../../shared/infrastructure/database.js';
import { CompanyClient } from '../domain/company-client.entity.js';

export interface CreateCompanyClientInput {
  nitRut: string;
  razonSocial: string;
  tenantId: string; // Obligatorio para asegurar el aislamiento
}

export class CreateCompanyClientUseCase {
  async execute(input: CreateCompanyClientInput): Promise<CompanyClient> {
    // Validación de negocio preventiva
    if (!input.nitRut || !input.razonSocial) {
      throw new Error('El NIT/RUT y la Razón Social son campos obligatorios.');
    }

    // Verificar si ya existe una empresa con ese mismo NIT dentro del mismo Tenant
    const existing = await pool.query(
      'SELECT id FROM empresa_cliente WHERE nit_rut = $1 AND tenant_id = $2;',
      [input.nitRut, input.tenantId]
    );

    if (existing.rows.length > 0) {
      throw new Error('Ya existe una empresa cliente registrada con ese NIT/RUT en tu organización.');
    }

    const id = crypto.randomUUID();
    const query = `
      INSERT INTO empresa_cliente (id, nit_rut, razon_social, tenant_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nit_rut as "nitRut", razon_social as "razonSocial", tenant_id as "tenantId", created_at as "createdAt";
    `;

    const result = await pool.query(query, [id, input.nitRut, input.razonSocial, input.tenantId]);
    return result.rows[0];
  }
}