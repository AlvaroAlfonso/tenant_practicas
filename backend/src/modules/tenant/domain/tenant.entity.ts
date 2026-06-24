// src/modules/tenant/domain/tenant.entity.ts

/**
 * Entidad de Dominio: Tenant
 * Representa a una empresa independiente (inquilino) dentro de nuestro SaaS.
 */
export class Tenant {
  constructor(
    public readonly id: string,         // UUID único de la empresa
    public readonly nombre: string,     // Nombre comercial de la empresa
    public readonly ruc: string,        // Identificación tributaria/NIT de la empresa
    public readonly activo: boolean,    // Estado de la suscripción de la empresa
    public readonly creadoEn?: Date     // Fecha de registro en el sistema
  ) {}
}