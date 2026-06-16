// src/server.ts
import fastify from 'fastify';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';

// Módulo de Autenticación (Bloque 1)
import { PgUserRepository } from './modules/auth/infrastructure/pg-user.repository.js';
import { LoginUseCase } from './modules/auth/application/login.use-case.js';
import { AuthController } from './modules/auth/infrastructure/auth.controller.js';

// NUEVAS IMPORTACIONES: Módulo de Tenants (Bloque 2)
import { PgTenantRepository } from './modules/tenant/infrastructure/pg-tenant.repository.js';
import { GetTenantByIdUseCase } from './modules/tenant/application/get-tenant-by-id.use-case.js';
import { TenantController } from './modules/tenant/infrastructure/tenant.controller.js';

// INYECCIÓN DE DEPENDENCIAS - MÓDULO DE CLIENTES B2B
import { PgCustomerRepository } from './modules/customer/infrastructure/pg-customer.repository.js';
import { CreateCustomerUseCase } from './modules/customer/application/create-customer.use-case.js';
import { GetCustomersByTenantUseCase } from './modules/customer/application/get-customers-by-tenant.use-case.js';
import { GetCustomerByIdUseCase } from './modules/customer/application/get-customer-by-id.use-case.js';
import { UpdateCustomerUseCase } from './modules/customer/application/update-customer.use-case.js';
import { DeleteCustomerUseCase } from './modules/customer/application/delete-customer.use-case.js';
import { CustomerController } from './modules/customer/infrastructure/customer.controller.js';

dotenv.config();

const server = fastify({ logger: true });

// Escudos Globales
await server.register(helmet); 
await server.register(jwt, {
  secret: process.env.JWT_SECRET || 'secreto_alterno_por_seguridad'
}); 


// Módulo de Autenticación
const userRepository = new PgUserRepository();
const loginUseCase = new LoginUseCase(userRepository);
const authController = new AuthController(loginUseCase);

// Módulo de Tenants 
const tenantRepository = new PgTenantRepository();
const getTenantByIdUseCase = new GetTenantByIdUseCase(tenantRepository);
const tenantController = new TenantController(getTenantByIdUseCase);

//Módulo de clientes b2b
// 1. Instanciamos el adaptador de infraestructura
const customerRepository = new PgCustomerRepository();

// 2. Instanciamos la capa de aplicación con el repositorio correspondiente
const createCustomerUseCase = new CreateCustomerUseCase(customerRepository);
const getCustomersByTenantUseCase = new GetCustomersByTenantUseCase(customerRepository);
const getCustomerByIdUseCase = new GetCustomerByIdUseCase(customerRepository);
const updateCustomerUseCase = new UpdateCustomerUseCase(customerRepository);
const deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepository);

// 3. Ensamblamos el controlador pasándole todos sus casos de uso
const customerController = new CustomerController(
  createCustomerUseCase,
  getCustomersByTenantUseCase,
  getCustomerByIdUseCase,
  updateCustomerUseCase,
  deleteCustomerUseCase
);


// 2. DEFINIR LAS RUTAS DEL SISTEMA
server.post('/api/auth/login', (request, reply) => authController.login(request, reply));

// Rutas Privadas / Protegidas con Escudo JWT
server.get('/api/tenant/mi-empresa', (request, reply) => tenantController.obtenerMiEmpresa(request, reply));

// REGISTRO DE ENDPOINTS INDUSTRIALES (CRUD COMPLETO) cliente b2b
// Agrega estas rutas debajo de tus rutas de /api/auth y /api/tenant existentes
server.post('/api/customers', (req, rep) => customerController.crear(req, rep));
server.get('/api/customers', (req, rep) => customerController.listarTodos(req, rep));
server.get('/api/customers/:id', (req, rep) => customerController.obtenerPorId(req, rep));
server.put('/api/customers/:id', (req, rep) => customerController.actualizar(req, rep));
server.delete('/api/customers/:id', (req, rep) => customerController.eliminar(req, rep));

// 3. ENCENDER EL SERVIDOR
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`\n🚀 [Server]: ¡Servidor EJECUTÁNDOSE, BLINDADO y listo para emitir JWT con éxito!`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();