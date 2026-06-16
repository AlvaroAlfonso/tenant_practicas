// src/test-connection.ts
import { pool } from './shared/infrastructure/database.js';
import bcrypt from 'bcrypt';

async function repararPassword() {
  console.log('⏳ [Reparador]: Generando hash de alta precisión para "Admin123!"...');
  
  try {
    // 1. Generamos el hash real usando un factor de coste de 12 desde tu propia computadora
    const passwordPlana = 'Admin123!';
    const salt = await bcrypt.genSalt(12);
    const hashGenerado = await bcrypt.hash(passwordPlana, salt);
    
    console.log(`🔑 [Hash Generado]: ${hashGenerado}`);

    // 2. Actualizamos la base de datos directamente usando el Pool
    const emailAActualizar = 'alvaro.alfonso@cyberbot.com';
    const query = 'UPDATE usuario SET password_hash = $1 WHERE email = $2;';
    
    await pool.query(query, [hashGenerado, emailAActualizar]);
    
    console.log(`✅ [Reparador]: Base de datos actualizada con éxito para: ${emailAActualizar}`);

  } catch (error) {
    console.error('❌ [Error Reparador]:', error);
  } finally {
    await pool.end();
    console.log('🏁 [Reparador]: Proceso terminado.');
  }
}

repararPassword();