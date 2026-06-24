export interface User {
  id: string;            // Mapea con el UUID de la tabla "usuario"
  username: string;      // Nombre de usuario único
  nombre: string;        // Nombre real de la persona
  email: string;         // Correo electrónico utilizado para el login
  passwordHash: string;  // Contraseña encriptada (nunca en texto plano)
  tenantId: string;      // UUID del inquilino al que pertenece este usuario
  rol: string;           // Rol operativo (ej. 'administrador', 'empleado')
  activo: boolean;       // Estado del usuario en el sistema
  createdAt?: Date;      // Fecha opcional de creación
}