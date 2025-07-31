import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, DataSource, In } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { Company } from '../../companies/entities/company.entity';
import {
  UserCompany,
  UserCompanyStatus,
} from '../../user-companies/entities/user-company.entity';
import { Product } from '../../products/entities/product.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import {
  UpdateInvoiceDto,
  UpdateInvoiceStatusDto,
} from '../dto/update-invoice.dto';
import { InvoiceFiltersDto } from '../dto/invoice-filters.dto';
import {
  InvoiceResponseDto,
  PaginatedInvoicesResponseDto,
  InvoiceSummaryDto,
} from '../dto/invoice-response.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new invoice with items
   */
  async create(
    companyId: string,
    createInvoiceDto: CreateInvoiceDto,
    userId: string,
  ): Promise<InvoiceResponseDto> {
    // Verify user has permission
    await this.validateUserCompanyAccess(userId, companyId, [
      'owner',
      'admin',
      'manager',
    ]);

    // Validate branch and customer belong to company
    await this.validateBranchAndCustomer(
      createInvoiceDto.branchId,
      createInvoiceDto.customerId,
      companyId,
    );

    // Validate products
    await this.validateProducts(createInvoiceDto.items, companyId);

    return this.dataSource.transaction(async (manager) => {
      // Generate invoice number
      const company = await manager.findOne(Company, {
        where: { id: companyId },
      });
      const invoiceNumber = await this.generateInvoiceNumber(
        company.name,
        manager,
      );

      // Create invoice
      const invoice = manager.create(Invoice, {
        ...createInvoiceDto,
        invoiceNumber,
        userId,
        issuedAt: createInvoiceDto.issuedAt || new Date(),
      });

      // Calculate subtotal from items
      let subtotal = 0;
      const itemsToCreate = [];

      for (const itemDto of createInvoiceDto.items) {
        const product = await manager.findOne(Product, {
          where: { id: itemDto.productId },
        });

        const item = manager.create(InvoiceItem, {
          productId: itemDto.productId,
          quantity: itemDto.quantity,
          unitPrice: itemDto.unitPrice,
          discountAmount: itemDto.discountAmount || 0,
          productName: product.name,
          productSku: product.sku,
          productDescription: product.description,
        });

        item.calculateTotal();
        subtotal += Number(item.totalPrice);
        itemsToCreate.push(item);
      }

      // Set calculated amounts
      invoice.subtotalAmount = subtotal;
      invoice.calculateTotals();

      const savedInvoice = await manager.save(Invoice, invoice);

      // Save items
      for (const item of itemsToCreate) {
        item.invoiceId = savedInvoice.id;
        await manager.save(InvoiceItem, item);
      }

      // Load complete invoice with relations
      const completeInvoice = await manager.findOne(Invoice, {
        where: { id: savedInvoice.id },
        relations: ['branch', 'customer', 'user', 'items', 'items.product'],
      });

      return this.mapToResponseDto(completeInvoice);
    });
  }

  /**
   * Find all invoices for a company with filters and pagination
   */
  async findByCompany(
    companyId: string,
    filters: InvoiceFiltersDto,
    userId: string,
  ): Promise<PaginatedInvoicesResponseDto> {
    // Verify user has access
    await this.validateUserCompanyAccess(userId, companyId);

    const queryBuilder = this.createFilteredQuery(companyId, filters);

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    const { page = 1, limit = 10 } = filters;
    const offset = (page - 1) * limit;

    // Get paginated results
    const invoices = await queryBuilder
      .skip(offset)
      .take(limit)
      .leftJoinAndSelect('invoice.branch', 'branch')
      .leftJoinAndSelect('invoice.customer', 'customer')
      .leftJoinAndSelect('invoice.user', 'user')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .getMany();

    const mappedInvoices = invoices.map((invoice) =>
      this.mapToResponseDto(invoice),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      invoices: mappedInvoices,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Find invoice by ID
   */
  async findById(
    invoiceId: string,
    userId: string,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: [
        'branch',
        'branch.company',
        'customer',
        'user',
        'items',
        'items.product',
      ],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Verify user has access to this company
    await this.validateUserCompanyAccess(userId, invoice.branch.company.id);

    return this.mapToResponseDto(invoice);
  }

  /**
   * Update invoice (only if draft)
   */
  async update(
    invoiceId: string,
    updateInvoiceDto: UpdateInvoiceDto,
    userId: string,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['branch', 'branch.company', 'items'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(userId, invoice.branch.companyId, [
      'owner',
      'admin',
      'manager',
    ]);

    if (!invoice.canBeModified()) {
      throw new BadRequestException('Only draft invoices can be modified');
    }

    return this.dataSource.transaction(async (manager) => {
      // Update invoice basic fields
      Object.assign(invoice, {
        taxRate: updateInvoiceDto.taxRate ?? invoice.taxRate,
        discountRate: updateInvoiceDto.discountRate ?? invoice.discountRate,
        dueDate: updateInvoiceDto.dueDate ?? invoice.dueDate,
        notes: updateInvoiceDto.notes ?? invoice.notes,
      });

      // Update items if provided
      if (updateInvoiceDto.items) {
        // Remove existing items
        await manager.delete(InvoiceItem, { invoiceId });

        // Create new items
        let subtotal = 0;
        for (const itemDto of updateInvoiceDto.items) {
          const product = await manager.findOne(Product, {
            where: { id: itemDto.productId },
          });

          const item = manager.create(InvoiceItem, {
            invoiceId,
            productId: itemDto.productId,
            quantity: itemDto.quantity,
            unitPrice: itemDto.unitPrice,
            discountAmount: itemDto.discountAmount || 0,
            productName: product.name,
            productSku: product.sku,
            productDescription: product.description,
          });

          item.calculateTotal();
          subtotal += Number(item.totalPrice);
          await manager.save(InvoiceItem, item);
        }

        invoice.subtotalAmount = subtotal;
      }

      // Recalculate totals
      invoice.calculateTotals();
      await manager.save(Invoice, invoice);

      return this.findById(invoiceId, userId);
    });
  }

  /**
   * Update invoice status
   */
  async updateStatus(
    invoiceId: string,
    updateStatusDto: UpdateInvoiceStatusDto,
    userId: string,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['branch', 'branch.company'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(userId, invoice.branch.companyId, [
      'owner',
      'admin',
      'manager',
    ]);

    // Validate status transition
    this.validateStatusTransition(invoice.status, updateStatusDto.status);

    // Update status
    invoice.status = updateStatusDto.status;

    if (updateStatusDto.status === InvoiceStatus.PAID) {
      invoice.paidDate = updateStatusDto.paidDate || new Date();
    } else if (updateStatusDto.status === InvoiceStatus.PENDING) {
      invoice.paidDate = null;
    }

    if (updateStatusDto.notes) {
      invoice.notes = updateStatusDto.notes;
    }

    await this.invoiceRepository.save(invoice);

    return this.findById(invoiceId, userId);
  }

  /**
   * Delete invoice (only if draft)
   */
  async remove(invoiceId: string, userId: string): Promise<void> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['branch', 'branch.company'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(userId, invoice.branch.companyId, [
      'owner',
      'admin',
      'manager',
    ]);

    if (!invoice.canBeModified()) {
      throw new BadRequestException('Only draft invoices can be deleted');
    }

    await this.invoiceRepository.remove(invoice);
  }

  /**
   * Get invoice summary statistics for a company
   */
  async getSummary(
    companyId: string,
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<InvoiceSummaryDto> {
    // Verify user has access
    await this.validateUserCompanyAccess(userId, companyId);

    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.branch', 'branch')
      .where('branch.companyId = :companyId', { companyId });

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'invoice.issuedAt BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    }

    const invoices = await queryBuilder.getMany();

    const summary: InvoiceSummaryDto = {
      totalInvoices: invoices.length,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      overdueAmount: 0,
      draftCount: 0,
      pendingCount: 0,
      paidCount: 0,
      overdueCount: 0,
      cancelledCount: 0,
      averageInvoiceAmount: 0,
      averagePaymentTime: 0,
    };

    let totalPaymentDays = 0;
    let paidInvoicesCount = 0;

    invoices.forEach((invoice) => {
      const amount = Number(invoice.totalAmount);
      summary.totalAmount += amount;

      switch (invoice.status) {
        case InvoiceStatus.DRAFT:
          summary.draftCount++;
          break;
        case InvoiceStatus.PENDING:
          summary.pendingCount++;
          summary.pendingAmount += amount;
          break;
        case InvoiceStatus.PAID:
          summary.paidCount++;
          summary.paidAmount += amount;
          if (invoice.paidDate && invoice.issuedAt) {
            const paymentDays = Math.ceil(
              (invoice.paidDate.getTime() - invoice.issuedAt.getTime()) /
                (1000 * 60 * 60 * 24),
            );
            totalPaymentDays += paymentDays;
            paidInvoicesCount++;
          }
          break;
        case InvoiceStatus.OVERDUE:
          summary.overdueCount++;
          summary.overdueAmount += amount;
          break;
        case InvoiceStatus.CANCELLED:
          summary.cancelledCount++;
          break;
      }
    });

    summary.averageInvoiceAmount =
      summary.totalInvoices > 0
        ? summary.totalAmount / summary.totalInvoices
        : 0;
    summary.averagePaymentTime =
      paidInvoicesCount > 0 ? totalPaymentDays / paidInvoicesCount : 0;

    return summary;
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
   * Validate branch and customer belong to company
   */
  private async validateBranchAndCustomer(
    branchId: string,
    customerId: string,
    companyId: string,
  ): Promise<void> {
    const [branch, customer] = await Promise.all([
      this.branchRepository.findOne({ where: { id: branchId } }),
      this.customerRepository.findOne({ where: { id: customerId } }),
    ]);

    if (!branch || branch.companyId !== companyId) {
      throw new BadRequestException(
        'Branch not found or does not belong to company',
      );
    }

    if (!customer || customer.companyId !== companyId) {
      throw new BadRequestException(
        'Customer not found or does not belong to company',
      );
    }
  }

  /**
   * Validate products belong to company
   */
  private async validateProducts(
    items: Array<{ productId: string; quantity: number; unitPrice: number }>,
    companyId: string,
  ): Promise<void> {
    const productIds = items.map((item) => item.productId);
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    const invalidProducts = products.filter(
      (product) => product.companyId !== companyId,
    );
    if (invalidProducts.length > 0) {
      throw new BadRequestException(
        'One or more products do not belong to company',
      );
    }
  }

  /**
   * Generate unique invoice number
   */
  private async generateInvoiceNumber(
    companyName: string,
    manager: any,
  ): Promise<string> {
    const prefix = companyName
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');

    // Get next sequence number for this month
    const pattern = `${prefix}-${year}${month}-%`;
    const lastInvoice = await manager
      .createQueryBuilder(Invoice, 'invoice')
      .where('invoice.invoiceNumber LIKE :pattern', { pattern })
      .orderBy('invoice.invoiceNumber', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastInvoice) {
      const lastNumber = lastInvoice.invoiceNumber.split('-')[2];
      sequence = parseInt(lastNumber) + 1;
    }

    return `${prefix}-${year}${month}-${sequence.toString().padStart(6, '0')}`;
  }

  /**
   * Create filtered query for invoices
   */
  private createFilteredQuery(
    companyId: string,
    filters: InvoiceFiltersDto,
  ): SelectQueryBuilder<Invoice> {
    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoin('invoice.branch', 'branch')
      .where('branch.companyId = :companyId', { companyId });

    // Apply filters
    if (filters.search) {
      queryBuilder.leftJoin('invoice.customer', 'customer');
      queryBuilder.andWhere(
        '(invoice.invoiceNumber ILIKE :search OR customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.customerId) {
      queryBuilder.andWhere('invoice.customerId = :customerId', {
        customerId: filters.customerId,
      });
    }

    if (filters.branchId) {
      queryBuilder.andWhere('invoice.branchId = :branchId', {
        branchId: filters.branchId,
      });
    }

    if (filters.userId) {
      queryBuilder.andWhere('invoice.userId = :userId', {
        userId: filters.userId,
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('invoice.status = :status', {
        status: filters.status,
      });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere(
        'invoice.issuedAt BETWEEN :startDate AND :endDate',
        {
          startDate: filters.startDate,
          endDate: filters.endDate,
        },
      );
    }

    if (filters.minAmount !== undefined) {
      queryBuilder.andWhere('invoice.totalAmount >= :minAmount', {
        minAmount: filters.minAmount,
      });
    }

    if (filters.maxAmount !== undefined) {
      queryBuilder.andWhere('invoice.totalAmount <= :maxAmount', {
        maxAmount: filters.maxAmount,
      });
    }

    if (filters.overdue) {
      queryBuilder.andWhere(
        'invoice.dueDate < :now AND invoice.status != :paidStatus',
        {
          now: new Date(),
          paidStatus: InvoiceStatus.PAID,
        },
      );
    }

    // Apply sorting
    const { sortBy = 'issuedAt', sortOrder = 'DESC' } = filters;
    const allowedSortFields = [
      'invoiceNumber',
      'totalAmount',
      'status',
      'issuedAt',
      'dueDate',
      'createdAt',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'issuedAt';
    queryBuilder.orderBy(`invoice.${sortField}`, sortOrder);

    return queryBuilder;
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(
    currentStatus: InvoiceStatus,
    newStatus: InvoiceStatus,
  ): void {
    const validTransitions = {
      [InvoiceStatus.DRAFT]: [InvoiceStatus.PENDING, InvoiceStatus.CANCELLED],
      [InvoiceStatus.PENDING]: [
        InvoiceStatus.PAID,
        InvoiceStatus.OVERDUE,
        InvoiceStatus.CANCELLED,
      ],
      [InvoiceStatus.OVERDUE]: [InvoiceStatus.PAID, InvoiceStatus.CANCELLED],
      [InvoiceStatus.PAID]: [], // Paid invoices cannot change status
      [InvoiceStatus.CANCELLED]: [], // Cancelled invoices cannot change status
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(invoice: Invoice): InvoiceResponseDto {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      branchId: invoice.branchId,
      customerId: invoice.customerId,
      userId: invoice.userId,
      status: invoice.status,
      subtotalAmount: Number(invoice.subtotalAmount),
      taxAmount: Number(invoice.taxAmount),
      taxRate: Number(invoice.taxRate),
      discountAmount: Number(invoice.discountAmount),
      discountRate: Number(invoice.discountRate),
      totalAmount: Number(invoice.totalAmount),
      dueDate: invoice.dueDate,
      paidDate: invoice.paidDate,
      notes: invoice.notes,
      issuedAt: invoice.issuedAt,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      isOverdue: invoice.isOverdue,
      isPaid: invoice.isPaid,
      daysPastDue: invoice.daysPastDue,
      branch: invoice.branch
        ? {
            id: invoice.branch.id,
            name: invoice.branch.name,
            code: invoice.branch.code,
          }
        : undefined,
      customer: invoice.customer
        ? {
            id: invoice.customer.id,
            displayName: invoice.customer.displayName,
            email: invoice.customer.email,
            taxId: invoice.customer.taxId,
          }
        : undefined,
      user: invoice.user
        ? {
            id: invoice.user.id,
            firstName: invoice.user.firstName,
            lastName: invoice.user.lastName,
          }
        : undefined,
      items:
        invoice.items?.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          productDescription: item.productDescription,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          discountAmount: Number(item.discountAmount),
          effectivePrice: item.effectivePrice,
          discountPercentage: item.discountPercentage,
          product: item.product
            ? {
                id: item.product.id,
                name: item.product.name,
                sku: item.product.sku,
                price: Number(item.product.price),
              }
            : undefined,
        })) || [],
    };
  }
}
