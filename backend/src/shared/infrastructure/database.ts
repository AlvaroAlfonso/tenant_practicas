// src/shared/infrastructure/database.ts
import pg from 'pg';
import dotenv from 'dotenv';

// Inicializar dotenv para que lea el archivo .env de la raíz del proyecto
dotenv.config();

const { Pool } = pg;

/**
 * Configuración centralizada del Pool de conexiones a PostgreSQL.
 * Al usar variables de entorno, blindamos las credenciales del negocio.
 */
export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  max: 20,                                     // Máximo de conexiones simultáneas en el pool
  idleTimeoutMillis: 30000,                    // Cierra conexiones inactivas después de 30 segundos
  connectionTimeoutMillis: 2000,               // Tiempo máximo de espera para conectar antes de dar error
});

// Monitor de eventos del Pool para diagnóstico del Backend
pool.on('connect', () => {
  console.log('🔌 [Database]: Nueva conexión establecida con éxito en el Pool.');
});

pool.on('error', (err) => {
  console.error('❌ [Database]: Error inesperado en el Pool de conexiones:', err);
});