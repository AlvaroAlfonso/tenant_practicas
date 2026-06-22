export class Task {
  constructor(
    public readonly id: string,
    public readonly tenantId: string,
    public readonly negocioId: string | null,
    public readonly titulo: string,
    public readonly descripcion: string | null,
    public readonly fechaVencimiento: Date,
    public readonly estado: string, // 'Pendiente' | 'En Progreso' | 'Completada'
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}