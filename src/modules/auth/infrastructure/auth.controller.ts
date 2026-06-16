// src/modules/auth/infrastructure/auth.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { LoginUseCase } from '../application/login.use-case.js';

/**
 * Adaptador de Entrada (Controlador HTTP).
 * Se encarga de recibir los datos de la red, delegar la lógica al caso de uso
 * y emitir las respuestas con los códigos de estado HTTP correctos.
 */
export class AuthController {
  // El controlador recibe el caso de uso listo mediante el constructor
  constructor(private loginUseCase: LoginUseCase) {}

  /**
   * Manejador de la petición de Login (POST)
   */
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 1. Extraemos los datos del cuerpo (body) de la petición HTTP
      const { email, password } = request.body as any;

      // Validación defensiva básica: Evita procesar datos vacíos
      if (!email || !password) {
        return reply.status(400).send({ 
          error: 'Bad Request', 
          message: 'El correo y la contraseña son requeridos.' 
        });
      }
      // Ejecutar la validación criptográfica en el caso de uso
      const user = await this.loginUseCase.execute(email, password);

      // 2. GENERACIÓN DEL TOKEN DE SESIÓN (JWT)
      // Guardamos dentro del token los datos mínimos para identificar al usuario en futuros clics
      const payload = {
        id: user.id,
        rol: user.rol,
        tenantId: user.tenantId
      };

      // Firmamos el token usando la herramienta nativa de @fastify/jwt
      // Configuramos que expire en 2 horas para obligar a re-autenticar si hay inactividad
      const token = await (reply as any).jwtSign(payload, { expiresIn: '2h' });

      return reply.status(200).send({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          tenantId: user.tenantId
        }
      });

    } catch (error: any) {
      // 4. Si el caso de uso arroja un error de credenciales, respondemos HTTP 401 (No autorizado)
      return reply.status(401).send({
        error: 'Unauthorized',
        message: error.message // "Credenciales inválidas o cuenta deshabilitada"
      });
    }
  }
}