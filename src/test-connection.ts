// src/test-connection.ts
import { LoginUseCase } from './modules/auth/application/login.use-case.js';
import { PgUserRepository } from './modules/auth/infrastructure/pg-user.repository.js';
import { pool } from './shared/infrastructure/database.js';

async function testLoginUseCase() {
  console.log('🚀 [Test Caso de Uso]: Inicializando entorno de autenticación...');

  // 1. Instanciamos el adaptador de infraestructura (Postgres)
  const userRepository = new PgUserRepository();

  // 2. Instanciamos el Caso de Uso pasándole el repositorio (Inyección de Dependencias)
  const loginUseCase = new LoginUseCase(userRepository);

  try {
    // === ESCENARIO A: INTENTO DE LOGIN EXITOSO ===
    console.log('\n🔐 [Escenario A]: Intentando ingresar con credenciales válidas...');
    
    // NOTA: Para este test, la contraseña debe ser exactamente igual a la que esté 
    // en tu tabla 'usuario' (en el paso anterior inyectamos el string plano o el hash)
    const emailValido = 'alvaro.alfonso@cyberbot.com';
    const passwordValida = '$2b$12$K89YTr82mX.eOux1wFvG94KmR1iP3qYwZa7oB2eRtK81qLwR7bXUJ'; 

    const loggedUser = await loginUseCase.execute(emailValido, passwordValida);
    
    console.log('✅ [Login Exitoso]: El Caso de Uso validó al usuario correctamente.');
    console.log(`   - Bienvenido: ${loggedUser.nombre}`);
    console.log(`   - Rol asignado: ${loggedUser.rol}`);
    console.log(`   - Pertenece al Tenant ID: ${loggedUser.tenantId}`);


    // === ESCENARIO B: INTENTO DE LOGIN CON CONTRASEÑA INCORRECTA (HACKER) ===
    console.log('\n🛡️ [Escenario B]: Intentando ingresar con contraseña incorrecta (Simulación de ataque)...');
    
    await loginUseCase.execute(emailValido, 'contrasena_falsa_123');
    
    console.log('❌ [Falla del Test]: El sistema permitió el ingreso con clave incorrecta. Revisa la lógica.');

  } catch (error: any) {
    // Capturamos el error generado por el sistema de seguridad
    console.log(`✅ [Bloqueo de Seguridad Exitoso]: El sistema denegó el acceso. Mensaje: "${error.message}"`);
  } finally {
    // Cerramos el pool de conexiones al terminar la prueba
    await pool.end();
    console.log('\n🏁 [Test]: Batería de pruebas de lógica de negocio finalizada.');
  }
}

testLoginUseCase();