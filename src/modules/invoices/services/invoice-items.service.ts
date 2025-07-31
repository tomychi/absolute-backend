import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceItem } from '../entities/invoice-item.entity';
import { Invoice } from '../entities/invoice.entity';
import { Product } from '../../products/entities/product.entity';
import {
  UserCompany,
  UserCompanyStatus,
} from '../../user-companies/entities/user-company.entity';
import { CreateInvoiceItemDto } from '../dto/create-invoice-item.dto';
import { InvoiceItemResponseDto } from '../dto/invoice-response.dto';

@Injectable()
export class InvoiceItemsService {
  constructor(
    @InjectRepository(InvoiceItem)
    private readonly invoiceItemRepository: Repository<InvoiceItem>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
  ) {}

  /**
   * Get items for a specific invoice
   */
  async findByInvoice(
    invoiceId: string,
    userId: string,
  ): Promise<InvoiceItemResponseDto[]> {
    // Verify invoice exists and user has access
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['branch', 'branch.company'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Verify user has access to this company
    await this.validateUserCompanyAccess(userId, invoice.branch.companyId);

    const items = await this.invoiceItemRepository.find({
      where: { invoiceId },
      relations: ['product'],
      order: { productName: 'ASC' },
    });

    return items.map((item) => this.mapToResponseDto(item));
  }

  /**
   * Add item to invoice (only if draft)
   */
  async addItem(
    invoiceId: string,
    createItemDto: CreateInvoiceItemDto,
    userId: string,
  ): Promise<InvoiceItemResponseDto> {
    // Verify invoice exists and user has access
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
      throw new BadRequestException('Only draft invoices can be modified');
    }

    // Verify product exists and belongs to company
    const product = await this.productRepository.findOne({
      where: { id: createItemDto.productId },
    });

    if (!product || product.companyId !== invoice.branch.companyId) {
      throw new BadRequestException(
        'Product not found or does not belong to company',
      );
    }

    // Create item
    const item = this.invoiceItemRepository.create({
      invoiceId,
      productId: createItemDto.productId,
      quantity: createItemDto.quantity,
      unitPrice: createItemDto.unitPrice,
      discountAmount: createItemDto.discountAmount || 0,
      productName: product.name,
      productSku: product.sku,
      productDescription: product.description,
    });

    item.calculateTotal();
    const savedItem = await this.invoiceItemRepository.save(item);

    // Recalculate invoice totals
    await this.recalculateInvoiceTotals(invoiceId);

    return this.mapToResponseDto(savedItem);
  }

  /**
   * Update invoice item (only if invoice is draft)
   */
  async updateItem(
    itemId: string,
    updateData: Partial<CreateInvoiceItemDto>,
    userId: string,
  ): Promise<InvoiceItemResponseDto> {
    const item = await this.invoiceItemRepository.findOne({
      where: { id: itemId },
      relations: ['invoice', 'invoice.branch', 'invoice.branch.company'],
    });

    if (!item) {
      throw new NotFoundException('Invoice item not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(
      userId,
      item.invoice.branch.companyId,
      ['owner', 'admin', 'manager'],
    );

    if (!item.invoice.canBeModified()) {
      throw new BadRequestException('Only draft invoices can be modified');
    }

    // Update item fields
    if (updateData.quantity !== undefined) {
      item.quantity = updateData.quantity;
    }
    if (updateData.unitPrice !== undefined) {
      item.unitPrice = updateData.unitPrice;
    }
    if (updateData.discountAmount !== undefined) {
      item.discountAmount = updateData.discountAmount;
    }

    // Recalculate item total
    item.calculateTotal();
    const updatedItem = await this.invoiceItemRepository.save(item);

    // Recalculate invoice totals
    await this.recalculateInvoiceTotals(item.invoiceId);

    return this.mapToResponseDto(updatedItem);
  }

  /**
   * Remove item from invoice (only if invoice is draft)
   */
  async removeItem(itemId: string, userId: string): Promise<void> {
    const item = await this.invoiceItemRepository.findOne({
      where: { id: itemId },
      relations: ['invoice', 'invoice.branch', 'invoice.branch.company'],
    });

    if (!item) {
      throw new NotFoundException('Invoice item not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(
      userId,
      item.invoice.branch.companyId,
      ['owner', 'admin', 'manager'],
    );

    if (!item.invoice.canBeModified()) {
      throw new BadRequestException('Only draft invoices can be modified');
    }

    const invoiceId = item.invoiceId;
    await this.invoiceItemRepository.remove(item);

    // Recalculate invoice totals
    await this.recalculateInvoiceTotals(invoiceId);
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
   * Recalculate invoice totals after item changes
   */
  private async recalculateInvoiceTotals(invoiceId: string): Promise<void> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: ['items'],
    });

    if (!invoice) return;

    // Calculate subtotal from items
    const subtotal = invoice.items.reduce((sum, item) => {
      return sum + Number(item.totalPrice);
    }, 0);

    invoice.subtotalAmount = subtotal;
    invoice.calculateTotals();

    await this.invoiceRepository.save(invoice);
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponseDto(item: InvoiceItem): InvoiceItemResponseDto {
    return {
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
    };
  }
}
