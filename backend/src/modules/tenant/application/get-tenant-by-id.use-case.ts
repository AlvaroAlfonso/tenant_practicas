// src/modules/tenant/application/get-tenant-by-id.use-case.ts
import { TenantRepository } from '../domain/tenant-repository.interface.js';
import { Tenant } from '../domain/tenant.entity.js';

/**
 * Caso de Uso: Obtener Empresa/Tenant por ID.
 * Aplica las reglas corporativas de acceso para los inquilinos del SaaS.
 */
export class GetTenantByIdUseCase {
  // Inyectamos el contrato del repositorio, no la base de datos directa
  constructor(private tenantRepository: TenantRepository) {}

  async execute(id: string): Promise<Tenant> {
    // 1. Solicitamos los datos al repositorio
    const tenant = await this.tenantRepository.findById(id);

    // 2. Defensa: Si la empresa no existe en el ecosistema, rebotamos la petición
    if (!tenant) {
      throw new Error('La empresa solicitada no existe en el sistema');
    }

    // 3. Defensa de Negocio: Si la empresa está suspendida (ej. impago), bloqueamos el acceso
    if (!tenant.activo) {
      throw new Error('La suscripción de la empresa se encuentra suspendida o inactiva');
    }

    // Si supera los escudos, devolvemos la entidad limpia al controlador
    return tenant;
  }
}