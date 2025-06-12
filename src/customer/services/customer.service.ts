import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from '../entities/customer.entity';
import { Repository } from 'typeorm';
import { CompanyEntity } from '../../company/entities/company.entity';
import { CustomerCreateDTO, CustomerUpdateDTO } from '../dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,

    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
  ) {}

  async createCustomer(data: CustomerCreateDTO): Promise<CustomerEntity> {
    const company = await this.companyRepository.findOneBy({
      id: data.companyId,
    });

    if (!company) throw new Error('Company not found');

    const newCustomer = this.customerRepository.create({
      ...data,
      company,
    });

    return this.customerRepository.save(newCustomer);
  }

  async getCustomersByCompany(companyId: string): Promise<CustomerEntity[]> {
    return this.customerRepository.find({
      where: {
        company: { id: companyId },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async updateCustomer(
    id: string,
    data: CustomerUpdateDTO,
  ): Promise<CustomerEntity> {
    await this.customerRepository.update(id, data);
    return this.customerRepository.findOneByOrFail({ id });
  }

  async deleteCustomer(id: string): Promise<void> {
    await this.customerRepository.delete(id);
  }

  async createGenericUser(companyBody: CompanyEntity): Promise<CustomerEntity> {
    let generic = await this.customerRepository.findOne({
      where: {
        company: { id: companyBody.id },
        isGeneric: true,
      },
    });

    if (!generic) {
      generic = this.customerRepository.create({
        name: `Cliente Generico`,
        email: `generico@${companyBody.name.toLowerCase().replace(/\s+/g, '')}.com`,
        isGeneric: true,
        company: { id: companyBody.id },
        phone: '0000000000',
        address: 'Direccion generica',
      });

      await this.customerRepository.save(generic);
    }

    return generic;
  }
}
