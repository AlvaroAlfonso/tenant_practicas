// backend/src/seed.ts
import pg from 'pg';
import bcrypt from 'bcrypt';

// Configura las credenciales de tu base de datos bd_multitenant
const pool = new pg.Pool({
  user: 'postgres',          // Cambia si usas otro usuario
  host: 'localhost',
  database: 'bd_multitenant', // Tu base de datos SaaS
  password: 'admin',         // CAMBIA AQUÍ TU CONTRASEÑA DE POSTGRESQL
  port: 5432,
});

async function runSeed() {
  const client = await pool.connect();
  try {
    console.log('⏳ Iniciando siembra de datos de prueba...');

    // 1. Limpiar datos viejos para evitar duplicados
    await client.query("DELETE FROM usuario WHERE email = 'prueba@process.com';");

    // 2. Generar el Hash usando la EXACTA misma librería de tu backend
    const passwordPlana = '@Prueba2026';
    const saltRounds = 10;
    const hashGenerado = await bcrypt.hash(passwordPlana, saltRounds);
    
    console.log(`🔐 Hash generado localmente: ${hashGenerado}`);

    // 3. Insertar el Plan de Servicio si no existe
    await client.query(`
      INSERT INTO plan_servicio (id, nombre, codigo, descripcion, precio_mensual, precio_anual, moneda, activo)
      VALUES ('a3b3c3d3-e3f3-4a3b-8c3d-111111111111', 'Plan Prácticas Enterprise', 'PLAN-TEST', 'Plan de pruebas', 0, 0, 'COP', true)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Insertar el Tenant si no existe
    await client.query(`
      INSERT INTO tenant (id, plan_servicio_id, nombre_comercial, razon_social, dominio_slug, rfc_nit, email_principal, estado)
      VALUES ('b4b4c4d4-e4f4-4b4c-8d4e-222222222222', 'a3b3c3d3-e3f3-4a3b-8c3d-111111111111', 'Active Process Test', 'Active Process SAS Test S.A.S.', 'active-process-test', '901234567-8', 'gerencia@process.com', 'active')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 5. Insertar el Usuario Administrador Activo
    await client.query(`
      INSERT INTO usuario (id, username, nombre, email, password_hash, tenant_id, rol, activo)
      VALUES (
        'c5c5d5e5-f5a5-4c5d-8e5f-333333333333',
        'pruebaprocess',
        'Álvaro Alfonso Test',
        'prueba@process.com',
        $1, -- Pasamos el hash nativo
        'b4b4c4d4-e4f4-4b4c-8d4e-222222222222',
        'administrador',
        true
      );
    `, [hashGenerado]);

    console.log('✅ ¡Usuario insertado y activado con éxito con la contraseña @Prueba2026!');
  } catch (error) {
    console.error('❌ Error ejecutando el seed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();