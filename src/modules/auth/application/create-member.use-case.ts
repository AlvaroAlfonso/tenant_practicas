// src/modules/auth/application/create-member.use-case.ts
import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { UserRepository } from '../domain/user-repository.interface.js';
import { User } from '../domain/user.entity.js';

interface CreateMemberInput {
  username: string;
  nombre: string;
  email: string;
  passwordPlana: string;
  tenantId: string; // El tenant_id viene del Token JWT del Administrador que lo crea
  rol: 'administrador' | 'empleado'; // Roles soportados en la base de datos
}

/**
 * Caso de Uso: Registrar / Invitar un nuevo Miembro al Equipo.
 * Encripta contraseñas, valida duplicados y asegura el aislamiento multi-tenant.
 */
export class CreateMemberUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: CreateMemberInput): Promise<Omit<User, 'passwordHash'>> {
    // 1. Validaciones defensivas básicas
    if (!input.username) throw new Error('El nombre de usuario es obligatorio.');
    if (!input.email) throw new Error('El correo electrónico es requerido.');
    if (!input.passwordPlana || input.passwordPlana.length < 6) {
      throw new Error('La contraseña es obligatoria y debe tener al menos 6 caracteres.');
    }

    // 2. Control de Duplicados: Evitar colisión de correos en el CRM
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('El correo electrónico ya se encuentra registrado en el sistema.');
    }

    // 3. Blindaje Criptográfico: Encriptar la contraseña de forma asíncrona
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(input.passwordPlana, saltRounds);

    // 4. Inicializar Entidad con Identificadores Únicos y Estado Activo por defecto
    const nuevoMiembro: User = {
      id: randomUUID(),
      username: input.username,
      nombre: input.nombre,
      email: input.email,
      passwordHash: passwordHash, // Guardamos la firma encriptada de forma segura
      tenantId: input.tenantId,   // Hereda el contexto del administrador
      rol: input.rol || 'empleado',
      activo: true                // Inicia con acceso habilitado al CRM
    };

    // 5. Persistencia física en la tabla 'usuario'
    const usuarioGuardado = await this.userRepository.save(nuevoMiembro);

    // 6. Retornar el objeto protegiendo la seguridad de la contraseña hash
    const { passwordHash: _, ...usuarioSeguro } = usuarioGuardado;
    return usuarioSeguro;
  }
}