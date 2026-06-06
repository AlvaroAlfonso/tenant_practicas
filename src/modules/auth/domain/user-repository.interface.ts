import { User } from './user.entity.js';

export interface UserRepository {
  /**
   * @param email 
   * @returns 
   */
  findByEmail(email: string): Promise<User | null>;
}