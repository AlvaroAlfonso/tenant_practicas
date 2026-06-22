import { TaskRepository } from '../domain/task-repository.interface.js';
import { Task } from '../domain/task.entity.js';

/**
 * Caso de Uso: Recuperar la Agenda de Tareas de la Empresa
 * Extrae los pendientes filtrados y protegidos estrictamente bajo aislamiento Tenant.
 */
export class GetTasksByTenantUseCase {
  constructor(private taskRepository: TaskRepository) {}

  async execute(tenantId: string): Promise<Task[]> {
    if (!tenantId) throw new Error('Operación denegada: Identificador de empresa ausente.');
    return await this.taskRepository.findByTenant(tenantId);
  }
}