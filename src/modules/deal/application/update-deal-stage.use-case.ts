// src/modules/deal/application/update-deal-stage.use-case.ts
import { DealRepository } from '../domain/deal-repository.interface.js';

export class UpdateDealStageUseCase {
  constructor(private dealRepository: DealRepository) {}

  async execute(id: string, tenantId: string, nuevaEtapa: string): Promise<void> {
    if (!id) throw new Error('El ID del negocio es requerido para actualizar su etapa.');
    if (!nuevaEtapa) throw new Error('La nueva etapa del pipeline es obligatoria.');

    const actualizado = await this.dealRepository.updateStage(id, tenantId, nuevaEtapa);
    
    if (!actualizado) {
      throw new Error('No se pudo actualizar el negocio. Verifique el ID o los permisos del Tenant.');
    }
  }
}