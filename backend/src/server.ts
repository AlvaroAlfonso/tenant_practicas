// src/server.ts
import fastify from 'fastify';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';

// Módulo de Autenticación (Bloque 1)
import { PgUserRepository } from './modules/auth/infrastructure/pg-user.repository.js';
import { LoginUseCase } from './modules/auth/application/login.use-case.js';
import { CreateMemberUseCase } from './modules/auth/application/create-member.use-case.js'; // <- NUEVA LÍNEA
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

// INYECCIÓN DE DEPENDENCIAS - MÓDULO DE INTERACCIONES (ACTIVIDAD)
import { PgActivityRepository } from './modules/activity/infrastructure/pg-activity.repository.js';
import { CreateActivityUseCase } from './modules/activity/application/create-activity.use-case.js';
import { GetActivitiesByNegocioUseCase } from './modules/activity/application/get-activities-by-negocio.use-case.js';
import { ActivityController } from './modules/activity/infrastructure/activity.controller.js';


//INYECCIÓN DE DEPENDENCIAS - MÓDULO DE NEGOCIOS (PIPELINE KANBAN)
import { PgDealRepository } from './modules/deal/infrastructure/pg-deal.repository.js';
import { CreateDealUseCase } from './modules/deal/application/create-deal.use-case.js';
import { GetDealsByTenantUseCase } from './modules/deal/application/get-deals-by-tenant.use-case.js';
import { UpdateDealStageUseCase } from './modules/deal/application/update-deal-stage.use-case.js';
import { DealController } from './modules/deal/infrastructure/deal.controller.js';


//INYECCIÓN DE DEPENDENCIAS - MÓDULO DE TAREAS Y RECORDATORIOS
import { PgTaskRepository } from './modules/task/infrastructure/pg-task.repository.js';
import { CreateTaskUseCase } from './modules/task/application/create-task.use-case.js';
import { GetTasksByTenantUseCase } from './modules/task/application/get-tasks-by-tenant.use-case.js';
import { UpdateTaskStatusUseCase } from './modules/task/application/update-task-status.use-case.js';
import { TaskController } from './modules/task/infrastructure/task.controller.js';

// INYECCIÓN DE DEPENDENCIAS - MÓDULO DE DASHBOARD Y ANALÍTICAS
import { PgDashboardRepository } from './modules/dashboard/infrastructure/pg-dashboard.repository.js';
import { GetPipelineRevenueUseCase } from './modules/dashboard/application/get-pipeline-revenue.use-case.js';
import { GetTasksEfficiencyUseCase } from './modules/dashboard/application/get-tasks-efficiency.use-case.js';
import { GetAdvisorActivitiesUseCase } from './modules/dashboard/application/get-advisor-activities.use-case.js';
import { DashboardController } from './modules/dashboard/infrastructure/dashboard.controller.js';


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
const createMemberUseCase = new CreateMemberUseCase(userRepository); 
// Ensamblamos el controlador pasándole ambos casos de uso en orden
const authController = new AuthController(loginUseCase, createMemberUseCase); // <- MODIFICADO


// Módulo de Tenants 
const tenantRepository = new PgTenantRepository();
const getTenantByIdUseCase = new GetTenantByIdUseCase(tenantRepository);
const tenantController = new TenantController(getTenantByIdUseCase);

//Módulo de clientes b2b
// 1. Instanciamos el adaptador de infraestructura
const customerRepository = new PgCustomerRepository();

//Módulo de negocios(pipeline kanban)
const dealRepository = new PgDealRepository();
const createDealUseCase = new CreateDealUseCase(dealRepository);
const getDealsByTenantUseCase = new GetDealsByTenantUseCase(dealRepository);
const updateDealStageUseCase = new UpdateDealStageUseCase(dealRepository);
const dealController = new DealController(createDealUseCase, getDealsByTenantUseCase, updateDealStageUseCase);



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


//Modulo de interacciones (Actividad)
const activityRepository = new PgActivityRepository();
const createActivityUseCase = new CreateActivityUseCase(activityRepository);
const getActivitiesByNegocioUseCase = new GetActivitiesByNegocioUseCase(activityRepository);

// 3. Ensamblamos el controlador con sus casos de uso correspondientes
const activityController = new ActivityController(createActivityUseCase, getActivitiesByNegocioUseCase);

//Módulo de tareas y recordatorios
const taskRepository = new PgTaskRepository();

// 2. Instanciamos la capa de aplicación con sus tres casos de uso de agenda
const createTaskUseCase = new CreateTaskUseCase(taskRepository);
const getTasksByTenantUseCase = new GetTasksByTenantUseCase(taskRepository);
const updateTaskStatusUseCase = new UpdateTaskStatusUseCase(taskRepository);

// 3. Ensamblamos el controlador pasándole sus dependencias puras
const taskController = new TaskController(createTaskUseCase, getTasksByTenantUseCase, updateTaskStatusUseCase);

// Módulo de Dashboard y Analíticas
const dashboardRepository = new PgDashboardRepository();
const getPipelineRevenueUseCase = new GetPipelineRevenueUseCase(dashboardRepository);
const getTasksEfficiencyUseCase = new GetTasksEfficiencyUseCase(dashboardRepository);
const getAdvisorActivitiesUseCase = new GetAdvisorActivitiesUseCase(dashboardRepository);

const dashboardController = new DashboardController(
  getPipelineRevenueUseCase,
  getTasksEfficiencyUseCase,
  getAdvisorActivitiesUseCase
);

// 2. DEFINIR LAS RUTAS DEL SISTEMA
server.post('/api/auth/login', (request, reply) => authController.login(request, reply));
// Nueva Ruta Protegida para registrar asesores/miembros del equipo
server.post('/api/auth/members', (req, rep) => authController.registerMember(req, rep));

// Rutas Privadas / Protegidas con Escudo JWT
server.get('/api/tenant/mi-empresa', (request, reply) => tenantController.obtenerMiEmpresa(request, reply));

// REGISTRO DE ENDPOINTS INDUSTRIALES (CRUD COMPLETO) cliente b2b
// Agrega estas rutas debajo de tus rutas de /api/auth y /api/tenant existentes
server.post('/api/customers', (req, rep) => customerController.crear(req, rep));
server.get('/api/customers', (req, rep) => customerController.listarTodos(req, rep));
server.get('/api/customers/:id', (req, rep) => customerController.obtenerPorId(req, rep));
server.put('/api/customers/:id', (req, rep) => customerController.actualizar(req, rep));
server.delete('/api/customers/:id', (req, rep) => customerController.eliminar(req, rep));


//REGISTRO DE ENDPOINTS PARA LA BITÁCORA CRM
// 1. Registrar una nueva interacción (Llamada, Correo, WhatsApp, Reunión)
server.post('/api/activities', (req, rep) => activityController.crear(req, rep));

// 2. Recuperar la línea de tiempo cronológica filtrada por negocio y blindada por tenant
server.get('/api/activities/timeline/:negocioId', (req, rep) => activityController.obtenerTimeline(req, rep));

//// REGISTRO DE ENDPOINTS PARA EL PIPELINE DE VENTAS (KANBAN)

server.post('/api/deals', (req, rep) => dealController.create(req, rep));
server.get('/api/deals', (req, rep) => dealController.listarTodos(req, rep));
server.patch('/api/deals/:id/stage', (req, rep) => dealController.actualizarEtapa(req, rep));

// REGISTRO DE ENDPOINTS PARA LA GESTIÓN DE TAREAS (AGENDA COMERCIAL)
server.post('/api/tasks', (req, rep) => taskController.crear(req, rep));
server.get('/api/tasks', (req, rep) => taskController.listarTodas(req, rep));
server.patch('/api/tasks/:id/status', (req, rep) => taskController.cambiarEstado(req, rep));

// REGISTRO DE ENDPOINTS DEL DASHBOARD Y METRICAS CORPORATIVAS
server.get('/api/dashboard/pipeline-revenue', (req, rep) => dashboardController.getPipelineRevenue(req, rep));
server.get('/api/dashboard/tasks-efficiency', (req, rep) => dashboardController.getTasksEfficiency(req, rep));
server.get('/api/dashboard/advisor-activities', (req, rep) => dashboardController.getAdvisorActivities(req, rep));


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