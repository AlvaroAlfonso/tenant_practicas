
//backend/src/modules/customer/infrastructure/customer.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
// 💡 Cambiamos la importación para usar el caso de uso real de la empresa cliente
import { CreateCompanyClientUseCase } from '../application/create-company-client.use-case.js';
import { GetCustomersByTenantUseCase } from '../application/get-customers-by-tenant.use-case.js';
import { GetCustomerByIdUseCase } from '../application/get-customer-by-id.use-case.js';
import { UpdateCustomerUseCase } from '../application/update-customer.use-case.js';
import { DeleteCustomerUseCase } from '../application/delete-customer.use-case.js';

/**
 * Adaptador de Entrada: Controlador HTTP para el Módulo de Clientes.
 */
export class CustomerController {
  constructor(
    // 💡 Cambiamos el tipo aquí para que coincida con el caso de uso real
    private createCustomerUseCase: CreateCompanyClientUseCase,
    private getCustomersByTenantUseCase: GetCustomersByTenantUseCase,
    private getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private updateCustomerUseCase: UpdateCustomerUseCase,
    private deleteCustomerUseCase: DeleteCustomerUseCase
  ) {}

 // =======================================================================
  // 1. CREAR CLIENTE (POST /api/customers)
 async crear(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      const user = request.user as { tenantId: string };
      
      // Capturamos las variables correctas que pasan por el validador
      const body = request.body as { empresa: string; nombre: string };

      const nuevoCliente = await this.createCustomerUseCase.execute({
        tenantId: user.tenantId,
        nitRut: body.empresa,       // Mapeamos al caso de uso
        razonSocial: body.nombre
      });

      return reply.status(201).send({
        message: 'Cliente corporativo registrado con éxito',
        customer: nuevoCliente
      });
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  }
  // =======================================================================
  // 2. LISTAR TODOS LOS CLIENTES DEL TENANT (GET /api/customers)
  // =======================================================================
  async listarTodos(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      const user = request.user as { tenantId: string };

      // Traemos únicamente la colección blindada de este inquilino
      const clientes = await this.getCustomersByTenantUseCase.execute(user.tenantId);

      return reply.status(200).send({
        message: 'Listado de clientes recuperado con éxito',
        count: clientes.length,
        customers: clientes
      });
    } catch (error: any) {
      return reply.status(401).send({ error: 'Unauthorized', message: error.message });
    }
  }

  // =======================================================================
  // 3. OBTENER UN CLIENTE ESPECÍFICO POR ID (GET /api/customers/:id)
  // =======================================================================
  async obtenerPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      const user = request.user as { tenantId: string };
      const { id } = request.params as { id: string }; // Extraemos el ID de la URL

      const cliente = await this.getCustomerByIdUseCase.execute(id, user.tenantId);

      return reply.status(200).send({
        message: 'Expediente de cliente encontrado',
        customer: cliente
      });
    } catch (error: any) {
      return reply.status(404).send({ error: 'Not Found', message: error.message });
    }
  }

  // =======================================================================
  // 4. ACTUALIZAR CLIENTE (PUT /api/customers/:id)
  // =======================================================================
  async actualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      const user = request.user as { tenantId: string };
      const { id } = request.params as { id: string };
      const body = request.body as { nombre: string; empresa: string; correo: string; telefono: string };

      const clienteActualizado = await this.updateCustomerUseCase.execute({
        id,
        tenantId: user.tenantId,
        ...body
      });

      return reply.status(200).send({
        message: 'Datos del cliente actualizados correctamente',
        customer: clienteActualizado
      });
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  }

  // =======================================================================
  // 5. BORRADO LÓGICO DE CLIENTE (DELETE /api/customers/:id)
  // =======================================================================
  async eliminar(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      const user = request.user as { tenantId: string };
      const { id } = request.params as { id: string };

      await this.deleteCustomerUseCase.execute(id, user.tenantId);

      return reply.status(200).send({
        message: 'Cliente dado de baja del sistema correctamente (Borrado lógico exitoso)'
      });
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  }
}