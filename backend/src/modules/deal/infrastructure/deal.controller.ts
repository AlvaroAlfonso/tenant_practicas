// src/modules/deal/infrastructure/deal.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateDealUseCase } from '../application/create-deal.use-case.js';
import { GetDealsByTenantUseCase } from '../application/get-deals-by-tenant.use-case.js';
import { UpdateDealStageUseCase } from '../application/update-deal-stage.use-case.js';

/**
 * Adaptador de Entrada: Controlador HTTP Fastify para el Pipeline de Ventas (Deals).
 * Libre de Express, acoplado al alto rendimiento nativo.
 */
export class DealController {
  constructor(
    private createDealUseCase: CreateDealUseCase,
    private getDealsByTenantUseCase: GetDealsByTenantUseCase,
    private updateDealStageUseCase: UpdateDealStageUseCase
  ) {}

  create = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify(); // Extrae el token corporativo de forma segura
      
      const user = request.user as { tenantId: string };
      const body = request.body as { 
        clienteId: string; 
        titulo: string; 
        valor: number; 
        etapa: string; 
        fechaCierreEstimada: string; 
      };

      const nuevoNegocio = await this.createDealUseCase.execute({
        tenantId: user.tenantId,
        clienteId: body.clienteId,
        titulo: body.titulo,
        valor: body.valor ? Number(body.valor) : 0,
        etapa: body.etapa,
        fechaCierreEstimada: body.fechaCierreEstimada
      });

      return reply.status(201).send(nuevoNegocio);
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  };

  listarTodos = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const user = request.user as { tenantId: string };
      
      const negocios = await this.getDealsByTenantUseCase.execute(user.tenantId);
      return reply.status(200).send(negocios);
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  };

  actualizarEtapa = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
      const user = request.user as { tenantId: string };
      const { id } = request.params as { id: string };
      const { etapa } = request.body as { etapa: string };

      await this.updateDealStageUseCase.execute(id, user.tenantId, etapa);
      return reply.status(200).send({ message: 'Etapa del negocio actualizada con éxito en el pipeline.' });
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  };
}