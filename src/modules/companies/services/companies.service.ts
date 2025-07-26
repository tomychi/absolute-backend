import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CompanyResponseDto } from '../dto/company-response.dto';
import { CompanyPublicDto } from '../dto/company-public.dto';
import { CompanySearchDto } from '../dto/company-search.dto';
import { Company } from '../entities/company.entity';
import { UserCompaniesService } from '../../user-companies/services/user-companies.service';

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly userCompaniesService: UserCompaniesService,
  ) {}

  /**
   * Create a new company
   */
  async create(
    createCompanyDto: CreateCompanyDto,
    createdByUserId: string,
  ): Promise<CompanyResponseDto> {
    // Check if tax ID already exists (if provided)
    if (createCompanyDto.taxId) {
      const existingCompany = await this.companyRepository.findOne({
        where: { taxId: createCompanyDto.taxId },
      });

      if (existingCompany) {
        throw new ConflictException(
          'A company with this tax ID already exists',
        );
      }
    }

    // Create the company
    const company = this.companyRepository.create({
      ...createCompanyDto,
      isActive: createCompanyDto.isActive ?? true,
    });

    try {
      const savedCompany = await this.companyRepository.save(company);

      await this.userCompaniesService.createOwnerRelationship(
        createdByUserId,
        savedCompany.id,
      );

      return CompanyResponseDto.fromEntity(savedCompany);
    } catch (error) {
      throw new BadRequestException('Failed to create company');
    }
  }

  /**
   * Find all companies with pagination and filtering
   * NOTE: In multi-tenant setup, this should filter by user's accessible companies
   */
  async findAll(
    searchDto: CompanySearchDto,
  ): Promise<PaginatedResult<CompanyResponseDto>> {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = searchDto;

    const skip = (page - 1) * limit;

    // Build where conditions
    const where: FindOptionsWhere<Company>[] = [];
    const baseCondition: FindOptionsWhere<Company> = {};

    // Filter by active status if specified
    if (isActive !== undefined) {
      baseCondition.isActive = isActive;
    }

    // Add search conditions
    if (search) {
      where.push(
        { ...baseCondition, name: ILike(`%${search}%`) },
        { ...baseCondition, description: ILike(`%${search}%`) },
      );
    } else {
      where.push(baseCondition);
    }

    const [companies, total] = await this.companyRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: companies.map((company) => CompanyResponseDto.fromEntity(company)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Find companies accessible by a specific user
   * TODO: This will use user-company relationships once implemented
   */
  async findByUser(
    userId: string,
    searchDto: CompanySearchDto,
  ): Promise<PaginatedResult<CompanyResponseDto>> {
    // For now, return all active companies
    // Later this will filter by user's company memberships
    return this.findAll({ ...searchDto, isActive: true });
  }

  /**
   * Find one company by ID
   */
  async findOne(id: string): Promise<CompanyResponseDto> {
    const company = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return CompanyResponseDto.fromEntity(company);
  }

  /**
   * Find company by ID and verify user access
   * TODO: Implement proper access control with user-company relationships
   */
  async findOneWithAccess(
    id: string,
    userId: string,
  ): Promise<CompanyResponseDto> {
    const company = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // TODO: Check if user has access to this company
    // For now, allow access to all companies (will be restricted later)

    return CompanyResponseDto.fromEntity(company);
  }

  /**
   * Get public company information
   */
  async getPublicInfo(id: string): Promise<CompanyPublicDto> {
    const company = await this.companyRepository.findOne({
      where: { id, isActive: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found or inactive');
    }

    return CompanyPublicDto.fromEntity(company);
  }

  /**
   * Update company
   */
  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    userId: string,
  ): Promise<CompanyResponseDto> {
    const company = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // TODO: Check if user has permission to update this company

    // Check if tax ID is being updated and already exists
    if (updateCompanyDto.taxId && updateCompanyDto.taxId !== company.taxId) {
      const existingCompany = await this.companyRepository.findOne({
        where: { taxId: updateCompanyDto.taxId },
      });

      if (existingCompany) {
        throw new ConflictException(
          'A company with this tax ID already exists',
        );
      }
    }

    // Merge the updates
    Object.assign(company, updateCompanyDto);

    try {
      const updatedCompany = await this.companyRepository.save(company);
      return CompanyResponseDto.fromEntity(updatedCompany);
    } catch (error) {
      throw new BadRequestException('Failed to update company');
    }
  }

  /**
   * Toggle company active status
   */
  async toggleStatus(id: string, userId: string): Promise<CompanyResponseDto> {
    const company = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // TODO: Check if user has permission to toggle status

    company.isActive = !company.isActive;

    try {
      const updatedCompany = await this.companyRepository.save(company);
      return CompanyResponseDto.fromEntity(updatedCompany);
    } catch (error) {
      throw new BadRequestException('Failed to update company status');
    }
  }

  /**
   * Soft delete company (deactivate)
   */
  async remove(id: string, userId: string): Promise<void> {
    const company = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // TODO: Check if user has permission to delete company
    // TODO: Check if company has active dependencies (branches, products, etc.)

    // Soft delete by deactivating
    company.isActive = false;

    try {
      await this.companyRepository.save(company);
    } catch (error) {
      throw new BadRequestException('Failed to delete company');
    }
  }

  /**
   * Hard delete company (for admin purposes - use with caution)
   */
  async hardDelete(id: string, userId: string): Promise<void> {
    // TODO: Implement proper admin authorization

    const result = await this.companyRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Company not found');
    }
  }

  /**
   * Search companies by name (public search)
   */
  async searchPublic(
    searchTerm: string,
    limit: number = 10,
  ): Promise<CompanyPublicDto[]> {
    const companies = await this.companyRepository.find({
      where: {
        name: ILike(`%${searchTerm}%`),
        isActive: true,
      },
      take: limit,
      order: { name: 'ASC' },
    });

    return companies.map((company) => CompanyPublicDto.fromEntity(company));
  }

  /**
   * Get companies by tax ID
   */
  async findByTaxId(taxId: string): Promise<CompanyResponseDto | null> {
    const company = await this.companyRepository.findOne({
      where: { taxId },
    });

    return company ? CompanyResponseDto.fromEntity(company) : null;
  }

  /**
   * Get active companies count
   */
  async getActiveCount(): Promise<number> {
    return this.companyRepository.count({
      where: { isActive: true },
    });
  }

  /**
   * Get company statistics
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withTaxId: number;
    withoutTaxId: number;
  }> {
    const [total, active, withTaxId] = await Promise.all([
      this.companyRepository.count(),
      this.companyRepository.count({ where: { isActive: true } }),
      this.companyRepository.count({ where: { taxId: ILike('%') } }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      withTaxId,
      withoutTaxId: total - withTaxId,
    };
  }

  /**
   * Verify company exists and is active
   */
  async verifyCompanyExists(id: string): Promise<boolean> {
    const count = await this.companyRepository.count({
      where: { id, isActive: true },
    });
    return count > 0;
  }

  /**
   * Get recently created companies
   */
  async getRecentlyCreated(limit: number = 5): Promise<CompanyResponseDto[]> {
    const companies = await this.companyRepository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return companies.map((company) => CompanyResponseDto.fromEntity(company));
  }
}
