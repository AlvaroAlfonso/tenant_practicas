// src/modules/dashboard/infrastructure/dashboard.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { GetPipelineRevenueUseCase } from '../application/get-pipeline-revenue.use-case.js';
import { GetTasksEfficiencyUseCase } from '../application/get-tasks-efficiency.use-case.js';
import { GetAdvisorActivitiesUseCase } from '../application/get-advisor-activities.use-case.js';

/**
 * Adaptador de Entrada HTTP.
 * Gestiona el consumo seguro de métricas y analíticas del CRM SaaS.
 */
export class DashboardController {
  constructor(
    private getPipelineRevenueUseCase: GetPipelineRevenueUseCase,
    private getTasksEfficiencyUseCase: GetTasksEfficiencyUseCase,
    private getAdvisorActivitiesUseCase: GetAdvisorActivitiesUseCase
  ) {}

  /**
   * Auxiliar privado para extraer, verificar el token JWT y validar el rol de Administrador.
   */
  private async extractTenantId(request: FastifyRequest, reply: FastifyReply): Promise<string | null> {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.status(401).send({ error: 'Unauthorized', message: 'Falta el token de autenticación.' });
      return null;
    }
    try {
      const token = authHeader.split(' ')[1];
      const decoded = await (request as any).server.jwt.verify(token);
      
      // BLINDAJE DE SEGURIDAD CONTRA ESCALACIÓN DE ROLES (RBAC)
      if (decoded.rol !== 'administrador') {
        reply.status(403).send({ 
          error: 'Forbidden', 
          message: 'Acceso denegado. Se requieren privilegios de Administrador para ver analíticas.' 
        });
        return null;
      }
      
      return decoded.tenantId;
    } catch (error) {
      reply.status(401).send({ error: 'Unauthorized', message: 'Token inválido o expirado.' });
      return null;
    }
  }

  async getPipelineRevenue(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = await this.extractTenantId(request, reply);
    if (!tenantId) return;

    try {
      const data = await this.getPipelineRevenueUseCase.execute(tenantId);
      return reply.status(200).send(data);
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  }

  async getTasksEfficiency(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = await this.extractTenantId(request, reply);
    if (!tenantId) return;

    try {
      const data = await this.getTasksEfficiencyUseCase.execute(tenantId);
      return reply.status(200).send(data);
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  }

  async getAdvisorActivities(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = await this.extractTenantId(request, reply);
    if (!tenantId) return;

    try {
      const data = await this.getAdvisorActivitiesUseCase.execute(tenantId);
      return reply.status(200).send(data);
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  }
}