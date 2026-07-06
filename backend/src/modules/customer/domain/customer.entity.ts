//backend/src/modules/customer/domain/customer.entity.ts
/**
 * Entidad de Dominio: Customer (Cliente CRM)
 * Define la estructura de un cliente B2B aislado dentro de un Tenant específico.
 */
export class Customer {
  constructor(
    public readonly id: string,          // UUID del cliente
    public readonly tenantId: string,     // UUID de la empresa dueña (Multi-tenant)
    public readonly nitRut: string,       // NIT o RUT de la empresa cliente
    public readonly razonSocial: string,  // Razón Social o nombre comercial
    public readonly correo: string,       // Email corporativo
    public readonly telefono: string,      // Teléfono de contacto
    public readonly createdAt?: Date      // Fecha de creación en base de datos
  ) {
    // Defensa de Dominio básica: Asegurar campos obligatorios antes de procesar
    if (!tenantId) throw new Error('El ID del Tenant es obligatorio para registrar un cliente.');
    if (!nitRut) throw new Error('El NIT/RUT de la empresa cliente es obligatorio.');
    if (!razonSocial) throw new Error('El nombre de la empresa cliente es obligatorio.');
  }
}