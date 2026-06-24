import { Task } from './task.entity.js';

export interface TaskRepository {

  create(task: Task): Promise<Task>;
  findByTenant(tenantId: string): Promise<Task[]>;
  updateStatus(id: string, tenantId: string, nuevoEstado: string): Promise<boolean>;
  
}