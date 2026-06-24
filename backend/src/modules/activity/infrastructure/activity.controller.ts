// src/modules/activity/infrastructure/activity.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateActivityUseCase } from '../application/create-activity.use-case.js';
import { GetActivitiesByNegocioUseCase } from '../application/get-activities-by-negocio.use-case.js';

/**
 * Adaptador de Entrada: Controlador HTTP para la Bitácora de Actividades.
 * Gobierna el flujo de registro y lectura cronológica bajo el escudo JWT.
 */
export class ActivityController {
  constructor(
    private createActivityUseCase: CreateActivityUseCase,
    private getActivitiesByNegocioUseCase: GetActivitiesByNegocioUseCase
  ) {}

  // =======================================================================
  // 1. REGISTRAR ACTIVIDAD (POST /api/activities)
  // =======================================================================
  async crear(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify(); // Validamos el pase VIP del usuario
      
      const body = request.body as { tipo: string; descripcion: string; negocioId: string };

      const nuevaActividad = await this.createActivityUseCase.execute(body);

      return reply.status(201).send({
        message: 'Interacción registrada con éxito en la bitácora',
        activity: nuevaActividad
      });
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  }

  // =======================================================================
  // 2. RECUPERAR TIMELINE DEL NEGOCIO (GET /api/activities/timeline/:negocioId)
  // =======================================================================
  async obtenerTimeline(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      
      const user = request.user as { tenantId: string };
      const { negocioId } = request.params as { negocioId: string };

      // Pasamos el tenantId extraído del token para activar el escudo relacional
      const historial = await this.getActivitiesByNegocioUseCase.execute(negocioId, user.tenantId);

      return reply.status(200).send({
        message: 'Línea de tiempo del negocio recuperada con éxito',
        count: historial.length,
        timeline: historial
      });
    } catch (error: any) {
      return reply.status(401).send({ error: 'Unauthorized', message: error.message });
    }
  }
}