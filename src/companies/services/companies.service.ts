import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CompaniesEntity } from '../entities/companies.entity';
import { CompanyDTO, CompanyUpdateDTO } from '../dto/company.dto';
import { ErrorManager } from 'src/utils/error.manager';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(CompaniesEntity)
    private readonly companyRepository: Repository<CompaniesEntity>,
  ) {}

  public async createCompany(body: CompanyDTO): Promise<CompaniesEntity> {
    try {
      return await this.companyRepository.save(body);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findCompanies(): Promise<CompaniesEntity[]> {
    try {
      const companies: CompaniesEntity[] = await this.companyRepository.find();

      if (companies.length === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontraron empresas',
        });
      }

      return companies;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findCompanyById(id: string): Promise<CompaniesEntity> {
    try {
      const company = await this.companyRepository
        .createQueryBuilder('company')
        .where({ id })
        .leftJoinAndSelect('company.locations', 'locations')
        .leftJoinAndSelect('company.usersIncludes', 'usersIncludes')
        .leftJoinAndSelect('usersIncludes.user', 'user')
        .getOne();

      if (!company) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro empresa con el id: ' + id,
        });
      }

      return company;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // traer comapanies with locations
  public async findCompanyWithLocations(id: string): Promise<any> {
    try {
      const company = await this.companyRepository
        .createQueryBuilder('company')
        .where({ id })
        .leftJoinAndSelect('company.locations', 'locations')
        .getOne();

      if (!company) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro empresa con el id: ' + id,
        });
      }

      return company.locations;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateCompany(
    body: CompanyUpdateDTO,
    id: string,
  ): Promise<UpdateResult> {
    try {
      const company: UpdateResult = await this.companyRepository.update(
        id,
        body,
      );

      if (company.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar empresa con el id: ' + id,
        });
      }

      return company;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteCompany(id: string): Promise<DeleteResult> {
    try {
      const company: DeleteResult = await this.companyRepository.delete(id);

      if (company.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar empresa con el id: ' + id,
        });
      }

      return company;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
