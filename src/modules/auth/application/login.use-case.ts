import { UserRepository } from '../domain/user-repository.interface.js';
import { User } from '../domain/user.entity.js';

export class LoginUseCase {
  constructor(private userRepository: UserRepository) {}
  /**
   * Ejecuta la lógica del inicio de sesión.
   */
  async execute(email: string, passwordPlana: string): Promise<User> {
    // 1. Buscar al usuario usando el puerto/contrato del dominio
    const user = await this.userRepository.findByEmail(email);

    // 2. Control de seguridad: Si no existe o está deshabilitado en el SaaS
    if (!user || !user.activo) {
      throw new Error('Credenciales inválidas o cuenta deshabilitada');
    }

    // 3. Validación de credencial (Simulada por ahora, luego usaremos encriptación real)
    // Comparamos la contraseña recibida con el passwordHash almacenado
    if (user.passwordHash !== passwordPlana) {
      throw new Error('Credenciales inválidas o cuenta deshabilitada');
    }

    // 4. Éxito: Retornamos el usuario autenticado de forma segura
    return user;
  }
}