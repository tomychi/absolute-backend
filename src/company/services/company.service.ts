import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CompanyEntity } from '../entities/company.entity';
import { CompanyCreateDTO, CompanyUpdateDTO } from '../dto/company.dto';
import { ErrorManager } from '../../utils/error.manager';
import { UserCompanyEntity } from '../../user/entities/userCompany.entity';
import { ACCESS_LEVEL } from '../../constants/roles';
import { UserService } from '../../user/services/user.service';
import { BranchService } from '../../branch/services/branch.service';
import { CustomerService } from '../../customer/services/customer.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private companyRepository: Repository<CompanyEntity>,

    @InjectRepository(UserCompanyEntity)
    private userCompanyRepository: Repository<UserCompanyEntity>,

    private readonly userService: UserService,
    private readonly branchService: BranchService,
    private readonly customerService: CustomerService,
  ) {}

  async createCompany(
    body: CompanyCreateDTO,
    userId: string,
  ): Promise<CompanyEntity> {
    try {
      const user = await this.userService.findUserById(userId);

      // Check if the company already exists
      const existingCompany = await this.companyRepository.findOne({
        where: { name: body.name },
      });
      if (existingCompany) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'La empresa ya existe',
        });
      }
      // Create the company
      const company: CompanyEntity = await this.companyRepository.save(body);

      // Associate the user with the company how owner
      await this.userCompanyRepository.save({
        accessLevel: ACCESS_LEVEL.OWNER,
        user: user,
        company,
      });

      // Create the branches for the company
      await this.branchService.createBranch({
        name: 'Sucursal Principal',
        location: company.address,
        companyId: company.id,
      });

      // Create the generic user for the company
      await this.customerService.createGenericUser(company);

      return await this.findCompanyById(company.id);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findCompanies(): Promise<CompanyEntity[]> {
    try {
      const companies: CompanyEntity[] = await this.companyRepository.find();

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

  public async findCompanyById(id: string): Promise<CompanyEntity> {
    try {
      // consultas personalizadas
      const company: CompanyEntity = await this.companyRepository
        .createQueryBuilder('company')
        .where({ id })
        .leftJoinAndSelect('company.usersIncludes', 'usersIncludes')
        .leftJoinAndSelect('usersIncludes.user', 'user')
        .leftJoinAndSelect('company.branches', 'branches')
        .getOne();

      if (!company) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro a la company',
        });
      }
      return company;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUsersIncludesByComapny(id: string): Promise<CompanyEntity> {
    try {
      // consultas personalizadas
      const company: CompanyEntity = await this.companyRepository
        .createQueryBuilder('company')
        .where({ id })
        .leftJoinAndSelect('company.usersIncludes', 'usersIncludes')
        .leftJoinAndSelect('usersIncludes.user', 'user')
        .getOne();

      if (!company) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro a la company',
        });
      }
      return company;
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
          message: 'No se pudo actualizar a la empresa: ' + id,
        });
      }

      return company;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteCompany(id: string): Promise<DeleteResult | undefined> {
    try {
      const company = await this.companyRepository.delete(id);
      if (company.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo eliminar a la empresa',
        });
      }

      return company;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
