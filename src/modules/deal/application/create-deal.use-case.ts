// src/modules/deal/application/create-deal.use-case.ts
import { randomUUID } from 'crypto';
import { DealRepository } from '../domain/deal-repository.interface.js';
import { Deal } from '../domain/deal.entity.js';

interface CreateDealInput {
  tenantId: string;
  clienteId: string;
  titulo: string;
  valor: number | null;
  etapa?: string;
  fechaCierreEstimada: string | null; // Viene como string ISO del Frontend
}

export class CreateDealUseCase {
  constructor(private dealRepository: DealRepository) {}

  async execute(input: CreateDealInput): Promise<Deal> {
    if (!input.titulo) throw new Error('El título o nombre del negocio es obligatorio.');
    if (!input.clienteId) throw new Error('El negocio debe estar vinculado a un Cliente ID corporativo.');

    const nuevoId = randomUUID();
    const etapaInicial = input.etapa || 'Prospecto';
    const fechaCierre = input.fechaCierreEstimada ? new Date(input.fechaCierreEstimada) : null;

    const nuevoNegocio = new Deal(
      nuevoId,
      input.tenantId,
      input.clienteId,
      input.titulo,
      input.valor,
      etapaInicial,
      fechaCierre
    );

    return await this.dealRepository.create(nuevoNegocio);
  }
}