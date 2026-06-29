// src/shared/infrastructure/database.ts
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Validar la ruta absoluta del archivo .env para evitar fallos de ubicación en Windows
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Escalamos hacia la raíz del backend (saliendo de shared, infrastructure y src)
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const { Pool } = pg;

/**
 * Configuración centralizada del Pool de conexiones a PostgreSQL.
 */
export const pool = new Pool({
  user: process.env.DB_USER || 'alvaro_andres_dev',
  password: process.env.DB_PASSWORD || 'Alvaro1998',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'bd_multitenant',
  max: 20,                                      
  idleTimeoutMillis: 30000,                    
  connectionTimeoutMillis: 2000,               
});

// Monitor de eventos del Pool para diagnóstico del Backend
pool.on('connect', () => {
  console.log('🔌 [Database]: Nueva conexión establecida con éxito en el Pool.');
});

pool.on('error', (err) => {
  console.error('❌ [Database]: Error inesperado en el Pool de conexiones:', err);
});