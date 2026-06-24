// src/modules/task/application/create-task.use-case.ts
import { randomUUID } from 'crypto';
import { TaskRepository } from '../domain/task-repository.interface.js';
import { Task } from '../domain/task.entity.js';

interface CreateTaskInput {
  tenantId: string;
  negocioId: string | null;
  titulo: string;
  descripcion: string | null;
  fechaVencimiento: string; // Viene como string ISO del Frontend
  estado?: string;
}

/**
 * Caso de Uso: Agendar Nueva Tarea o Recordatorio
 * Inicializa identificadores únicos y valida los requerimientos de tiempo.
 */
export class CreateTaskUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    if (!input.titulo) throw new Error('El título de la tarea es obligatorio.');
    if (!input.fechaVencimiento) throw new Error('La fecha de vencimiento es requerida para agendar el recordatorio.');

    const nuevoId = randomUUID();
    const estadoInicial = input.estado || 'Pendiente';
    const fechaLimite = new Date(input.fechaVencimiento);

    if (isNaN(fechaLimite.getTime())) {
      throw new Error('La fecha de vencimiento proporcionada no tiene un formato válido.');
    }

    const nuevaTarea = new Task(
      nuevoId,
      input.tenantId,
      input.negocioId,
      input.titulo,
      input.descripcion,
      fechaLimite,
      estadoInicial
    );

    return await this.taskRepository.create(nuevaTarea);
  }
}