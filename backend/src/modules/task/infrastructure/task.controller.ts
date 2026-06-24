// src/modules/task/infrastructure/task.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateTaskUseCase } from '../application/create-task.use-case.js';
import { GetTasksByTenantUseCase } from '../application/get-tasks-by-tenant.use-case.js';
import { UpdateTaskStatusUseCase } from '../application/update-task-status.use-case.js';

/**
 * Adaptador de Entrada: Controlador HTTP para la Gestión de Tareas.
 * Controla los flujos de agenda bajo el escudo multi-tenant de Fastify.
 */
export class TaskController {
  constructor(
    private createTaskUseCase: CreateTaskUseCase,
    private getTasksByTenantUseCase: GetTasksByTenantUseCase,
    private updateTaskStatusUseCase: UpdateTaskStatusUseCase
  ) {}

  // =======================================================================
  // 1. AGENDAR TAREA (POST /api/tasks)
  // =======================================================================
  crear = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify(); // Validación del token corporativo
      
      const user = request.user as { tenantId: string };
      const body = request.body as { 
        negocioId: string | null; 
        titulo: string; 
        descripcion: string | null; 
        fechaVencimiento: string;
        estado?: string;
      };

      const nuevaTarea = await this.createTaskUseCase.execute({
        tenantId: user.tenantId,
        negocioId: body.negocioId,
        titulo: body.titulo,
        descripcion: body.descripcion,
        fechaVencimiento: body.fechaVencimiento,
        estado: body.estado
      });

      return reply.status(201).send(nuevaTarea);
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  };

  // =======================================================================
  // 2. LISTAR AGENDA (GET /api/tasks)
  // =======================================================================
  listarTodas = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      
      const user = request.user as { tenantId: string };
      const tareas = await this.getTasksByTenantUseCase.execute(user.tenantId);
      
      return reply.status(200).send(tareas);
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  };

  // =======================================================================
  // 3. MUTAR ESTADO / CHECKBOX (PATCH /api/tasks/:id/status)
  // =======================================================================
  cambiarEstado = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      
      const user = request.user as { tenantId: string };
      const { id } = request.params as { id: string };
      const { estado } = request.body as { estado: string };

      await this.updateTaskStatusUseCase.execute(id, user.tenantId, estado);
      
      return reply.status(200).send({ 
        message: 'Estado de la tarea actualizado con éxito en la agenda.' 
      });
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  };
}