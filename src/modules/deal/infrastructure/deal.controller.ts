// src/modules/deal/infrastructure/deal.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateDealUseCase } from '../application/create-deal.use-case.js';
import { GetDealsByTenantUseCase } from '../application/get-deals-by-tenant.use-case.js';
import { UpdateDealStageUseCase } from '../application/update-deal-stage.use-case.js';

/**
 * Adaptador de Entrada: Controlador HTTP para el Pipeline de Negocios (Deals).
 * Administra el tablero Kanban bajo el escudo de seguridad Fastify JWT.
 */
export class DealController {
  constructor(
    private createDealUseCase: CreateDealUseCase,
    private getDealsByTenantUseCase: GetDealsByTenantUseCase,
    private updateDealStageUseCase: UpdateDealStageUseCase
  ) {}

  // =======================================================================
  // 1. CREAR NEGOCIO (POST /api/deals)
  // =======================================================================
  async crear(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify(); // Validación del token corporativo
      
      const user = request.user as { tenantId: string };
      const body = request.body as { 
        clienteId: string; 
        titulo: string; 
        valor: number | null; 
        etapa?: string; 
        fechaCierreEstimada: string | null 
      };

      const nuevoNegocio = await this.createDealUseCase.execute({
        tenantId: user.tenantId,
        clienteId: body.clienteId,
        titulo: body.titulo,
        valor: body.valor,
        etapa: body.etapa,
        fechaCierreEstimada: body.fechaCierreEstimada
      });

      return reply.status(201).send(nuevoNegocio);
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  }

  // =======================================================================
  // 2. RECUPERAR KANBAN (GET /api/deals)
  // =======================================================================
  async listarTodos(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      
      const user = request.user as { tenantId: string };
      const negocios = await this.getDealsByTenantUseCase.execute(user.tenantId);
      
      return reply.status(200).send(negocios);
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  }

  // =======================================================================
  // 3. ACTUALIZAR ETAPA KANBAN (PATCH/PUT /api/deals/:id/stage)
  // =======================================================================
  async actualizarEtapa(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      
      const user = request.user as { tenantId: string };
      const { id } = request.params as { id: string };
      const { etapa } = request.body as { etapa: string };

      await this.updateDealStageUseCase.execute(id, user.tenantId, etapa);
      
      return reply.status(200).send({ 
        message: 'Etapa del negocio actualizada con éxito en el pipeline.' 
      });
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  }
}