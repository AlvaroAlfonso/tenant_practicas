// frontend/src/app/core/models/auth.models.ts

/**
 * Contrato de credenciales requeridas por el Login del Backend.
 * Previene el envío de campos corruptos o vacíos.
 */
export interface LoginCredentials {
  email: string;
  passwordHash: string; // Se mapea con la lógica del backend
}

/**
 * Estructura de la respuesta exitosa que emite nuestro Fastify Server.
 */
export interface AuthResponse {
  token: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: 'administrador' | 'empleado';
    tenantId: string;
  };
}