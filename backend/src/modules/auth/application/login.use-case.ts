// src/modules/auth/application/login.use-case.ts
import { UserRepository } from '../domain/user-repository.interface.js';
import { User } from '../domain/user.entity.js';
import bcrypt from 'bcrypt'; 


export class LoginUseCase {
  // Aplicamos Inyección de Dependencias a través del constructor
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, passwordPlana: string): Promise<User> {
    // 1. Buscamos al usuario en la base de datos a través del repositorio
    const user = await this.userRepository.findByEmail(email);

    // 2. Defensa: Si el usuario no existe, disparamos un error genérico por seguridad
    if (!user) {
      throw new Error('Credenciales inválidas o cuenta deshabilitada');
    }
    
    const isPasswordValid = await bcrypt.compare(passwordPlana, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas o cuenta deshabilitada');
    }

    if (!user.activo) {
      throw new Error('Credenciales inválidas o cuenta deshabilitada');
    }
    // Si supera todos los escudos de seguridad, devolvemos el usuario autenticado al controlador
    return user;
  }
}