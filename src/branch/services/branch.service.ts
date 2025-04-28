import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BranchEntity } from '../entities/branch.entity';
import { Repository } from 'typeorm';
import { CompanyEntity } from '../../company/entities/company.entity';
import { BranchCreateDTO } from '../dto/branch.dto';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(BranchEntity)
    private branchRepository: Repository<BranchEntity>,
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,
  ) {}

  // Método para crear una nueva sucursal
  async createBranch(BranchCreateDTO: BranchCreateDTO): Promise<BranchEntity> {
    const { name, location, companyId } = BranchCreateDTO;

    // Buscar la empresa asociada a la sucursal
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new Error('Company not found'); // Manejo de error si la empresa no existe
    }

    const newBranch = this.branchRepository.create({
      name,
      location,
      company, // Relación con la empresa
    });

    return this.branchRepository.save(newBranch); // Guardar la nueva sucursal en la base de datos
  }
}
