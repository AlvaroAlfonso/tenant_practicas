import { CustomerRepository } from '../domain/customer-repository.interface.js';
import { Customer } from '../domain/customer.entity.js';

export class GetCustomerByIdUseCase {
  constructor(private customerRepository: CustomerRepository) {}

  async execute(id: string, tenantId: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id, tenantId);
    
    if (!customer) {
      throw new Error('El cliente solicitado no existe o no pertenece a su empresa.');
    }

    return customer;
  }
}