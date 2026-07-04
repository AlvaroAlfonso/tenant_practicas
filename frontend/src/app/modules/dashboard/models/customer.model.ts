// frontend/src/app/modules/dashboard/models/customer.model.ts
export interface Customer {
  id: string;
  tenantId: string;
  nombre: string;
  empresa: string; // Aquí llegará el nombre de la empresa resuelto por el LEFT JOIN del backend
  correo: string;
  telefono: string;
  createdAt?: string;
}