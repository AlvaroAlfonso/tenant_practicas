
//backend/src/modules/customer/infrastructure/customer.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
// 💡 Importamos el caso de uso alineado con la tabla cliente y los contratos de tu backend
import { CreateCustomerUseCase } from '../application/create-customer.use-case.js';
import { GetCustomersByTenantUseCase } from '../application/get-customers-by-tenant.use-case.js';
import { GetCustomerByIdUseCase } from '../application/get-customer-by-id.use-case.js';
import { UpdateCustomerUseCase } from '../application/update-customer.use-case.js';
import { DeleteCustomerUseCase } from '../application/delete-customer.use-case.js';

/**
 * Interfaz explícita para resolver el error de tipado en request.user de Fastify
 */
interface AuthenticatedUser {
  id: string;
  tenantId: string;
  email: string;
}

/**
 * Adaptador de Entrada: Controlador HTTP para el Módulo de Clientes.
 */
export class CustomerController {
  constructor(
    // 💡 Ajustamos el tipo aquí para que no choque con CreateCompanyClientInput
    private createCustomerUseCase: CreateCustomerUseCase,
    private getCustomersByTenantUseCase: GetCustomersByTenantUseCase,
    private getCustomerByIdUseCase: GetCustomerByIdUseCase,
    private updateCustomerUseCase: UpdateCustomerUseCase,
    private deleteCustomerUseCase: DeleteCustomerUseCase
  ) {}

  // =======================================================================
  // 1. CREAR CLIENTE (POST /api/customers)
  // =======================================================================
  async crear(request: FastifyRequest, reply: FastifyReply) {
  try {
    // 🕵️‍♂️ LOG 2: Verificamos qué llegó exactamente al backend en la petición HTTP
    console.log('📥 [BACKEND CONTROLLER] Datos recibidos en request.body:', request.body);
    console.log('📥 [BACKEND CONTROLLER] Usuario decodificado en request.user:', request.user);

    await request.jwtVerify();
    const user = request.user as AuthenticatedUser;
    const body = request.body as { nombre: string; empresa: string; correo?: string; telefono?: string };

    // 🕵️‍♂️ LOG 3: Verificamos los datos mapeados justo antes de ir al Caso de Uso
    console.log('⚙️ [BACKEND CONTROLLER] Pasando al Caso de Uso -> tenantId:', user.tenantId, 'nombre:', body.nombre, 'empresa:', body.empresa);

    const nuevoCliente = await this.createCustomerUseCase.execute({
      tenantId: user.tenantId,
      nombre: body.nombre,     
      empresa: body.empresa,   
      correo: body.correo || '',
      telefono: body.telefono || ''
    });

    return reply.status(201).send(nuevoCliente);
  } catch (error: any) {
    // 🕵️‍♂️ LOG 4: Captura detallada si el error ocurriera DENTRO del controlador o del Caso de Uso
    console.error('❌ [BACKEND CONTROLLER ERROR] Se detectó un fallo en el proceso:', error.message);
    return reply.status(400).send({ error: 'Bad Request', message: error.message });
  }
}

  // =======================================================================
  // 2. LISTAR EMPRESAS CLIENTE DEL TENANT (GET /api/customers)
  // =======================================================================
  async listarTodos(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      const user = request.user as AuthenticatedUser;

      const empresas = await this.getCustomersByTenantUseCase.execute(user.tenantId);

      return reply.status(200).send({
        message: 'Listado de empresas clientes recuperado con éxito',
        count: empresas.length,
        customers: empresas
      });
    } catch (error: any) {
      return reply.status(401).send({ error: 'Unauthorized', message: error.message });
    }
  }

  // =======================================================================
  // 3. OBTENER POR ID (GET /api/customers/:id)
  // =======================================================================
  async obtenerPorId(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      const user = request.user as AuthenticatedUser;
      const { id } = request.params as { id: string };

      const empresa = await this.getCustomerByIdUseCase.execute(id, user.tenantId);

      return reply.status(200).send({
        message: 'Empresa cliente encontrada',
        customer: empresa
      });
    } catch (error: any) {
      return reply.status(404).send({ error: 'Not Found', message: error.message });
    }
  }

  // =======================================================================
  // 4. ACTUALIZAR (PUT /api/customers/:id)
  // =======================================================================
  async actualizar(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      const user = request.user as AuthenticatedUser;
      const { id } = request.params as { id: string };
      const body = request.body as { nombre: string; empresa: string; correo?: string; telefono?: string };

      // Mapeamos los campos exactos que exige UpdateCustomerInput sin errores
      const clienteActualizado = await this.updateCustomerUseCase.execute({
        id,
        tenantId: user.tenantId,
        nombre: body.nombre,
        empresa: body.empresa,
        correo: body.correo || '',
        telefono: body.telefono || ''
      });

      return reply.status(200).send({
        message: 'Datos comerciales actualizados correctamente',
        customer: clienteActualizado
      });
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  }

  // =======================================================================
  // 5. BORRADO (DELETE /api/customers/:id)
  // =======================================================================
  async eliminar(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      const user = request.user as AuthenticatedUser;
      const { id } = request.params as { id: string };

      await this.deleteCustomerUseCase.execute(id, user.tenantId);

      return reply.status(200).send({
        message: 'Empresa cliente eliminada del CRM correctamente'
      });
    } catch (error: any) {
      return reply.status(400).send({ error: 'Bad Request', message: error.message });
    }
  }
}