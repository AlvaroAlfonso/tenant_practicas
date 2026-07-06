// backend/src/auth/application/login.use-case.ts
import { UserRepository } from '../domain/user-repository.interface.js';
import { User } from '../domain/user.entity.js';
import bcrypt from 'bcryptjs';

export class LoginUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, passwordPlana: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);

    // 1. Verificación de existencia del usuario
    if (!user) {
      throw new Error('Credenciales inválidas o cuenta deshabilitada');
    }

    // 2. Verificación criptográfica de la contraseña
    const isPasswordValid = await bcrypt.compare(passwordPlana, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas o cuenta deshabilitada');
    }

    // 3. Verificación del estado lógico del usuario
    if (!user.activo) {
      throw new Error('Credenciales inválidas o cuenta deshabilitada');
    }

    // Retorna el usuario si pasa todas las barreras de seguridad
    return user;
  }
}