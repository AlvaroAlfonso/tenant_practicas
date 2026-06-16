
/**
 * Entidad de Dominio: Customer (Cliente CRM)
 * Define la estructura de un cliente B2B aislado dentro de un Tenant específico.
 */
export class Customer {
  constructor(
    public readonly id: string,           // UUID del cliente
    public readonly tenantId: string,     // UUID de la empresa dueña (Multi-tenant)
    public readonly nombre: string,       // Nombre del contacto principal
    public readonly empresa: string,      // Razón social o empresa cliente
    public readonly correo: string,       // Email corporativo
    public readonly telefono: string,     // Teléfono de contacto
    public readonly createdAt?: Date      // Fecha de creación en base de datos
  ) {
    // Defensa de Dominio básica: Asegurar campos obligatorios antes de procesar
    if (!tenantId) throw new Error('El ID del Tenant es obligatorio para registrar un cliente.');
    if (!empresa) throw new Error('El nombre de la empresa cliente es obligatorio.');
  }
}