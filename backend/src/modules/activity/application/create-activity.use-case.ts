// src/modules/activity/application/create-activity.use-case.ts
import { randomUUID } from 'crypto';
import { ActivityRepository } from '../domain/activity-repository.interface.js';
import { Activity } from '../domain/activity.entity.js';

interface CreateActivityInput {
  tipo: string;
  descripcion: string;
  negocioId: string;
}

/**
 * Caso de Uso: Registrar Actividad en la Bitácora.
 * Inicializa los datos de auditoría temporal (fecha) y persiste la interacción.
 */
export class CreateActivityUseCase {
  constructor(private activityRepository: ActivityRepository) {}

  async execute(input: CreateActivityInput): Promise<Activity> {
    if (!input.tipo) throw new Error('El tipo de actividad (Llamada, Correo, etc.) es obligatorio.');
    if (!input.negocioId) throw new Error('La actividad debe estar vinculada a un Negocio ID válido.');

    const nuevoId = randomUUID();
    const fechaActual = new Date(); // Captura el timestamp en tiempo real para producción

    const nuevaActividad = new Activity(
      nuevoId,
      input.tipo,
      input.descripcion,
      fechaActual,
      input.negocioId
    );

    return await this.activityRepository.create(nuevaActividad);
  }
}