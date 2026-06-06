// src/server.ts
import fastify from 'fastify';
import dotenv from 'dotenv';
import { PgUserRepository } from './modules/auth/infrastructure/pg-user.repository.js';
import { LoginUseCase } from './modules/auth/application/login.use-case.js';
import { AuthController } from './modules/auth/infrastructure/auth.controller.js';

// Cargar las variables del archivo .env
dotenv.config();

const server = fastify({ logger: true }); // Habilitamos el logger nativo para ver peticiones en tiempo real

// 1. INICIALIZAR LA ARQUITECTURA HEXAGONAL (Unión de piezas)
const userRepository = new PgUserRepository();
const loginUseCase = new LoginUseCase(userRepository);
const authController = new AuthController(loginUseCase);

// 2. DEFINIR LAS RUTAS DEL SISTEMA
// Cuando llegue un POST a /api/auth/login, Fastify llamará al controlador
server.post('/api/auth/login', (request, reply) => authController.login(request, reply));

// 3. ENCENDER EL SERVIDOR EN EL PUERTO CONFIGURADO
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    
    // Escuchamos en el puerto y configuramos '0.0.0.0' por si usas Codespaces o Docker
    await server.listen({ port, host: '0.0.0.0' });
    
    console.log(`\n🚀 [Server]: ¡Servidor ejecutándose con éxito!`);
    console.log(`📡 [Ruta Lista]: POST http://localhost:${port}/api/auth/login\n`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();