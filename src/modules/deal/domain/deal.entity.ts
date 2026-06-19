/**
 * Entidad de Dominio: Deal (Negocio / Oportunidad de Venta)
 * Representa un trato comercial dentro del pipeline del CRM multi-tenant.
 */
export class Deal {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly clienteId: string,
    public readonly titulo: string,
    public readonly valor: number | null,
    public readonly etapa: string, // 'Prospecto' | 'Propuesta' | 'Negociación' | 'Ganado' | 'Perdido'
    public readonly fechaCierreEstimada: Date | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}