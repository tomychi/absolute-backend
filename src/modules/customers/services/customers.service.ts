import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, FindOptionsWhere } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { Company } from '../../companies/entities/company.entity';
import {
  UserCompany,
  UserCompanyStatus,
} from '../../user-companies/entities/user-company.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerFiltersDto } from '../dto/customer-filters.dto';
import {
  CustomerResponseDto,
  PaginatedCustomersResponseDto,
} from '../dto/customer-response.dto';

export interface CustomerStatsResponse {
  totalCustomers: number;
  customersWithContact: number;
  completeCustomers: number;
  incompleteCustomers: number;
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
  ) {}

  /**
   * Create a new customer for a company
   */
  async create(
    companyId: string,
    createCustomerDto: CreateCustomerDto,
    userId: string,
  ): Promise<CustomerResponseDto> {
    // Verify user has permission to create customers in this company
    await this.validateUserCompanyAccess(userId, companyId, [
      'owner',
      'admin',
      'manager',
    ]);

    // Verify company exists
    const company = await this.companyRepository.findOne({
      where: { id: companyId, isActive: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found or inactive');
    }

    // Validate unique fields
    await this.validateUniqueFields(companyId, createCustomerDto);

    try {
      const customer = this.customerRepository.create({
        ...createCustomerDto,
        companyId,
      });

      const savedCustomer = await this.customerRepository.save(customer);

      // Load relations for response
      return this.findById(savedCustomer.id, userId);
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique violation
        throw new ConflictException(
          'Customer with this information already exists',
        );
      }
      throw error;
    }
  }

  /**
   * Find all customers for a company with search and pagination
   */
  async findByCompany(
    companyId: string,
    filters: CustomerFiltersDto,
    userId: string,
  ): Promise<PaginatedCustomersResponseDto> {
    // Verify user has access to this company
    await this.validateUserCompanyAccess(userId, companyId);

    const queryBuilder = this.createFilteredQuery(companyId, filters);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const { page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    // Get paginated results
    const customers = await queryBuilder
      .skip(offset)
      .take(limit)
      .leftJoinAndSelect('customer.company', 'company')
      .getMany();

    const mappedCustomers = customers.map((customer) =>
      this.mapToResponseDto(customer),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      customers: mappedCustomers,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Find customer by ID
   */
  async findById(
    customerId: string,
    userId: string,
    includeStats = false,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
      relations: ['company'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Verify user has access to this company
    await this.validateUserCompanyAccess(userId, customer.companyId);

    const responseDto = this.mapToResponseDto(customer);

    if (includeStats) {
      // TODO: Add invoice statistics when invoices module is ready
      // const stats = await this.getCustomerInvoiceStats(customerId);
      // responseDto.invoiceCount = stats.invoiceCount;
      // responseDto.totalInvoiced = stats.totalInvoiced;
      // responseDto.lastInvoiceDate = stats.lastInvoiceDate;
    }

    return responseDto;
  }

  /**
   * Update customer
   */
  async update(
    customerId: string,
    updateCustomerDto: UpdateCustomerDto,
    userId: string,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
      relations: ['company'],
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(userId, customer.companyId, [
      'owner',
      'admin',
      'manager',
    ]);

    // Validate unique fields
    await this.validateUniqueFields(
      customer.companyId,
      updateCustomerDto,
      customerId,
    );

    try {
      Object.assign(customer, updateCustomerDto);
      await this.customerRepository.save(customer);

      return this.findById(customerId, userId);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Customer with this information already exists',
        );
      }
      throw error;
    }
  }

  /**
   * Delete customer
   */
  async remove(customerId: string, userId: string): Promise<void> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(userId, customer.companyId, [
      'owner',
      'admin',
      'manager',
    ]);

    // TODO: Check if customer has invoices when invoices module is ready
    // const invoiceCount = await this.checkCustomerInvoices(customerId);
    // if (invoiceCount > 0) {
    //   throw new BadRequestException(
    //     'Cannot delete customer with existing invoices.',
    //   );
    // }

    await this.customerRepository.remove(customer);
  }

  /**
   * Get customer statistics for a company
   */
  async getCustomerStats(
    companyId: string,
    userId: string,
  ): Promise<CustomerStatsResponse> {
    // Verify user has access
    await this.validateUserCompanyAccess(userId, companyId);

    const result = await this.customerRepository
      .createQueryBuilder('customer')
      .select([
        'COUNT(*) as totalCustomers',
        'COUNT(CASE WHEN customer.email IS NOT NULL OR customer.phone IS NOT NULL THEN 1 END) as customersWithContact',
        'COUNT(CASE WHEN (customer.firstName IS NOT NULL AND customer.lastName IS NOT NULL) OR customer.taxId IS NOT NULL OR customer.email IS NOT NULL THEN 1 END) as completeCustomers',
      ])
      .where('customer.companyId = :companyId', { companyId })
      .getRawOne();

    return {
      totalCustomers: parseInt(result.totalCustomers) || 0,
      customersWithContact: parseInt(result.customersWithContact) || 0,
      completeCustomers: parseInt(result.completeCustomers) || 0,
      incompleteCustomers:
        parseInt(result.totalCustomers) - parseInt(result.completeCustomers),
    };
  }

  /**
   * Search customers by text
   */
  async searchCustomers(
    companyId: string,
    searchTerm: string,
    userId: string,
    limit = 10,
  ): Promise<CustomerResponseDto[]> {
    // Verify user has access
    await this.validateUserCompanyAccess(userId, companyId);

    const customers = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.companyId = :companyId', { companyId })
      .andWhere(
        '(LOWER(customer.firstName) LIKE LOWER(:search) OR LOWER(customer.lastName) LIKE LOWER(:search) OR LOWER(customer.email) LIKE LOWER(:search) OR LOWER(customer.taxId) LIKE LOWER(:search))',
        { search: `%${searchTerm}%` },
      )
      .orderBy('customer.firstName', 'ASC')
      .take(limit)
      .getMany();

    return customers.map((customer) => this.mapToResponseDto(customer));
  }

  // Private helper methods

  /**
   * Validate user has access to company with specific roles
   */
  private async validateUserCompanyAccess(
    userId: string,
    companyId: string,
    requiredRoles?: string[],
  ): Promise<UserCompany> {
    const userCompany = await this.userCompanyRepository.findOne({
      where: {
        userId,
        companyId,
        isActive: true,
        status: UserCompanyStatus.ACTIVE,
      },
      relations: ['accessLevel'],
    });

    if (!userCompany) {
      throw new ForbiddenException('Access denied to this company');
    }

    if (
      requiredRoles &&
      !requiredRoles.includes(userCompany.accessLevel.name)
    ) {
      throw new ForbiddenException(
        `Required role: ${requiredRoles.join(' or ')}`,
      );
    }

    return userCompany;
  }

  /**
   * Create filtered query for customers
   */
  private createFilteredQuery(
    companyId: string,
    filters: CustomerFiltersDto,
  ): SelectQueryBuilder<Customer> {
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.companyId = :companyId', { companyId });

    // Apply filters
    if (filters.search) {
      queryBuilder.andWhere(
        '(LOWER(customer.firstName) LIKE LOWER(:search) OR LOWER(customer.lastName) LIKE LOWER(:search) OR LOWER(customer.email) LIKE LOWER(:search) OR LOWER(customer.taxId) LIKE LOWER(:search))',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.firstName) {
      queryBuilder.andWhere(
        'LOWER(customer.firstName) LIKE LOWER(:firstName)',
        {
          firstName: `%${filters.firstName}%`,
        },
      );
    }

    if (filters.lastName) {
      queryBuilder.andWhere('LOWER(customer.lastName) LIKE LOWER(:lastName)', {
        lastName: `%${filters.lastName}%`,
      });
    }

    if (filters.email) {
      queryBuilder.andWhere('LOWER(customer.email) LIKE LOWER(:email)', {
        email: `%${filters.email}%`,
      });
    }

    if (filters.taxId) {
      queryBuilder.andWhere('LOWER(customer.taxId) LIKE LOWER(:taxId)', {
        taxId: `%${filters.taxId}%`,
      });
    }

    if (filters.hasContactInfo !== undefined) {
      if (filters.hasContactInfo) {
        queryBuilder.andWhere(
          '(customer.email IS NOT NULL OR customer.phone IS NOT NULL)',
        );
      } else {
        queryBuilder.andWhere(
          '(customer.email IS NULL AND customer.phone IS NULL)',
        );
      }
    }

    if (filters.isComplete !== undefined) {
      if (filters.isComplete) {
        queryBuilder.andWhere(
          '((customer.firstName IS NOT NULL AND customer.lastName IS NOT NULL) OR customer.taxId IS NOT NULL OR customer.email IS NOT NULL)',
        );
      } else {
        queryBuilder.andWhere(
          '((customer.firstName IS NULL OR customer.lastName IS NULL) AND customer.taxId IS NULL AND customer.email IS NULL)',
        );
      }
    }

    // Apply sorting
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = filters;
    const allowedSortFields = [
      'firstName',
      'lastName',
      'email',
      'taxId',
      'createdAt',
      'updatedAt',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`customer.${sortField}`, sortOrder);

    return queryBuilder;
  }

  /**
   * Validate unique fields for customer
   */
  private async validateUniqueFields(
    companyId: string,
    dto: CreateCustomerDto | UpdateCustomerDto,
    excludeId?: string,
  ): Promise<void> {
    const { email, taxId } = dto;

    if (email) {
      const emailQuery = this.customerRepository
        .createQueryBuilder('customer')
        .where('LOWER(customer.email) = LOWER(:email)', { email })
        .andWhere('customer.companyId = :companyId', { companyId });

      if (excludeId) {
        emailQuery.andWhere('customer.id != :excludeId', { excludeId });
      }

      const existingEmail = await emailQuery.getOne();
      if (existingEmail) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    if (taxId) {
      const taxIdQuery = this.customerRepository
        .createQueryBuilder('customer')
        .where('LOWER(customer.taxId) = LOWER(:taxId)', { taxId })
        .andWhere('customer.companyId = :companyId', { companyId });

      if (excludeId) {
        taxIdQuery.andWhere('customer.id != :excludeId', { excludeId });
      }

      const existingTaxId = await taxIdQuery.getOne();
      if (existingTaxId) {
        throw new ConflictException('Customer with this tax ID already exists');
      }
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: customer.fullName,
      displayName: customer.displayName,
      taxId: customer.taxId,
      email: customer.email,
      phone: customer.phone,
      companyId: customer.companyId,
      isComplete: customer.isComplete(),
      hasContactInfo: customer.hasContactInfo(),
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      company: customer.company
        ? {
            id: customer.company.id,
            name: customer.company.name,
          }
        : undefined,
    };
  }
}
