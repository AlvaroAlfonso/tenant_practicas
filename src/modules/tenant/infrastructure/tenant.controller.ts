// src/modules/tenant/infrastructure/tenant.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { GetTenantByIdUseCase } from '../application/get-tenant-by-id.use-case.js';

/**
 * Adaptador de Entrada: Controlador HTTP para Tenants.
 * Extrae la identidad del token cifrado y despacha el caso de uso.
 */
export class TenantController {
  constructor(private getTenantByIdUseCase: GetTenantByIdUseCase) {}

  async obtenerMiEmpresa(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 1. VALIDACIÓN MAESTRA DEL JWT
      // jwtVerify valida la firma digital. Si el token falló o expiró, arroja un error automáticamente.
      await request.jwtVerify();

      // 2. EXTRACCIÓN DE IDENTIDAD MULTI-TENANT
      // Al pasar la verificación, Fastify inyecta el contenido descifrado del token en request.user
      const usuarioLogueado = request.user as { id: string; rol: string; tenantId: string };
      
      console.log(`🔐 [Seguridad]: Petición autorizada para Usuario: ${usuarioLogueado.id} - Tenant: ${usuarioLogueado.tenantId}`);

      // 3. EJECUTAR EL NEGOCIO
      // Usamos el tenantId extraído DIRECTAMENTE del token (seguridad absoluta, el cliente no lo puede adulterar)
      const tenant = await this.getTenantByIdUseCase.execute(usuarioLogueado.tenantId);

      // 4. RESPUESTA EXITOSA
      return reply.status(200).send({
        message: 'Datos de la empresa obtenidos con éxito',
        tenant
      });

    } catch (error: any) {
      // Si el token no es válido o el caso de uso falla, respondemos con código de bloqueo
      return reply.status(401).send({
        error: 'Unauthorized',
        message: error.message || 'Token de autenticación inválido o ausente'
      });
    }
  }
}