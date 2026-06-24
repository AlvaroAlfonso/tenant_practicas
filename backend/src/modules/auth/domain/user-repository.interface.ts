import { User } from './user.entity.js';

export interface UserRepository {
  /**
   * Busca un usuario por su correo electrónico (Utilizado en Login)
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Guarda o persiste un nuevo miembro del equipo en la base de datos
   * @param user Entidad completa del usuario a registrar
   */
  save(user: User): Promise<User>;
}