import { FastifyRequest, FastifyReply } from 'fastify';
import { LoginUseCase } from '../application/login.use-case.js';
import { CreateMemberUseCase } from '../application/create-member.use-case.js';
import { RegisterTenantUseCase } from '../application/register-tenant.use-case.js';

/**
 * Adaptador de Entrada (Controlador HTTP).
 * Administra los flujos de inicio de sesión y gestión del equipo del Workspace.
 */
export class AuthController {
  // Inyectamos ambos casos de uso a través del constructor
  constructor(
    private loginUseCase: LoginUseCase,
    private createMemberUseCase: CreateMemberUseCase,
    private registerTenantUseCase: RegisterTenantUseCase
  ) {}

  /**
   * Manejador de la petición de Login (POST /api/auth/login)
   */
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as any;

      if (!email || !password) {
        return reply.status(400).send({ 
          error: 'Bad Request', 
          message: 'El correo y la contraseña son requeridos.' 
        });
      }

      const user = await this.loginUseCase.execute(email, password);

      // Guardamos en el payload los datos clave de identidad corporativa
      const payload = {
        id: user.id,
        rol: user.rol,
        tenantId: user.tenantId
      };

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
      return reply.status(401).send({
        error: 'Unauthorized',
        message: error.message
      });
    }
  }

  /**
   * Manejador para Registrar Miembros del Equipo (POST /api/auth/members)
   * ¡CON VERIFICACIÓN INLINE ADAPTADA A FASTIFY!
   */
  async registerMember(request: FastifyRequest, reply: FastifyReply) {
    try {
      // 1. EJECUTAR VERIFICACIÓN CRIPTOGRÁFICA DEL TOKEN
      // Esto lee la cabecera 'Authorization: Bearer <TOKEN>' y llena el objeto request.user
      await request.jwtVerify();

      // 2. EXTRAER IDENTITY CONTEXT DEL TOKEN JWT
      const { tenantId, rol: userRol } = (request as any).user;

      // 3. REGLA DE ACCESO: Solo administradores pueden agregar personal al CRM
      if (userRol !== 'administrador') {
        return reply.status(403).send({
          error: 'Forbidden',
          message: 'Acceso denegado. Solo los administradores pueden registrar miembros en el workspace.'
        });
      }

      // 4. Extraer payload del cuerpo de la petición
      const { username, nombre, email, password, rol } = request.body as any;

      // 5. Ejecutar el caso de uso acoplando de forma segura el tenant_id de la sesión
      const nuevoUsuario = await this.createMemberUseCase.execute({
        username,
        nombre,
        email,
        passwordPlana: password,
        tenantId, // El asesor heredará la empresa del admin de forma transparente
        rol: rol || 'empleado'
      });

      // 6. Retornar éxito corporativo
      return reply.status(201).send({
        message: 'Miembro del equipo registrado con éxito en el workspace.',
        user: nuevoUsuario
      });

    } catch (error: any) {
      // Si el token es inválido o expiró, Fastify arrojará un error que atrapamos aquí
      if (error.statusCode === 401 || error.message.includes('Authorization')) {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Token de sesión ausente, inválido o expirado.'
        });
      }

      // Capturamos las validaciones de negocio del caso de uso (ej. correo duplicado)
      return reply.status(400).send({
        error: 'Bad Request',
        message: error.message
      });
    }
  }
  async registerTenant(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { nombreComercial, rfcNit, emailPrincipal, username, nombreAdmin, password } = request.body as any;

      // Validación preventiva estricta antes de tocar base de datos
      if (!nombreComercial || !rfcNit || !emailPrincipal || !username || !nombreAdmin || !password) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Todos los campos corporativos y de usuario son mandatorios.'
        });
      }

      const resultado = await this.registerTenantUseCase.execute({
        nombreComercial,
        rfcNit,
        emailPrincipal,
        username,
        nombreAdmin,
        passwordPlana: password
      });

      return reply.status(201).send({
        message: 'Empresa y cuenta de administrador configurados con éxito.',
        data: resultado
      });

    } catch (error: any) {
      return reply.status(400).send({
        error: 'Bad Request',
        message: error.message
      });
    }
  }
}