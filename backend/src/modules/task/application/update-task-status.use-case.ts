import { TaskRepository } from '../domain/task-repository.interface.js';

/**
 * Caso de Uso: Mutar Estado de la Tarea (Checkbox)
 * Actualiza el ciclo de vida de la actividad asegurando la pertenencia al inquilino.
 */
export class UpdateTaskStatusUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(id: string, tenantId: string, nuevoEstado: string): Promise<void> {
    if (!id) throw new Error('El ID de la tarea es requerido para modificar su estado.');
    if (!nuevoEstado) throw new Error('El nuevo estado de la tarea es obligatorio.');

    const actualizado = await this.taskRepository.updateStatus(id, tenantId, nuevoEstado);
    
    if (!actualizado) {
      throw new Error('No se pudo actualizar la tarea. Verifique el ID o los permisos de acceso de su empresa.');
    }
  }
}