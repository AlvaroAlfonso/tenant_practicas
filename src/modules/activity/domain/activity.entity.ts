// src/modules/activity/domain/activity.entity.ts

/**
 * Entidad de Dominio: Actividad (Bitácora de Interacciones CRM)
 * Representa un registro histórico de contacto con el cliente ligado a un negocio.
 */
export class Activity {
  constructor(
    public readonly id: string,
    public readonly tipo: string,         // 'Llamada', 'Correo', 'Reunión', etc.
    public readonly descripcion: string,  // Detalle o minuta de la interacción
    public readonly fechaProgramada: Date, // Cuándo se ejecutó o programó
    public readonly negocioId: string     // Relación con el Pipeline de Ventas
  ) {}
}