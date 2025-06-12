import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InvoiceEntity, InvoiceStatus } from '../entities/invoice.entity';
import { InvoiceItemEntity } from '../entities/invoice-item.entity';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { BranchEntity } from '../../branch/entities/branch.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { CreateInvoiceDTO } from '../dto/createInvoice.dto';
import { InventoryEntity } from '../../inventory/entities/inventory.entity';
import { StockMovementEntity } from '../../stock/entities/stockMovement.entity';
import { StockMovementTypeEntity } from '../../stock/entities/stockMovementType.entity';
import { CompanyEntity } from '../../company/entities/company.entity';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepo: Repository<InvoiceEntity>,

    @InjectRepository(InvoiceItemEntity)
    private readonly itemRepo: Repository<InvoiceItemEntity>,

    @InjectRepository(CompanyEntity)
    private readonly companyRepo: Repository<CompanyEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,

    @InjectRepository(BranchEntity)
    private readonly branchRepo: Repository<BranchEntity>,

    @InjectRepository(InventoryEntity)
    private readonly inventoryRepo: Repository<InventoryEntity>,

    @InjectRepository(StockMovementEntity)
    private readonly stockMovementRepo: Repository<StockMovementEntity>,

    @InjectRepository(StockMovementTypeEntity)
    private stockMovementTypeRepo: Repository<StockMovementTypeEntity>,
  ) {}

  async createInvoice(payload: CreateInvoiceDTO): Promise<InvoiceEntity> {
    const { branchId, userId, customerId, items, note, companyId } = payload;

    const company = await this.companyRepo.findOneByOrFail({ id: companyId });
    if (!company) {
      throw new Error(`Compañía con ID ${companyId} no encontrada`);
    }
    const user = await this.userRepo.findOneByOrFail({ id: userId });

    if (!user) {
      throw new Error(`Usuario con ID ${userId} no encontrado`);
    }
    const branch = await this.branchRepo.findOneByOrFail({ id: branchId });

    if (!branch) {
      throw new Error(`Sucursal con ID ${branchId} no encontrada`);
    }
    const customer = await this.customerRepo.findOneBy({ id: customerId });

    let subtotal = 0;
    for (const item of items) {
      subtotal += item.quantity * item.unitPrice;
    }

    const tax = 0; // o calcular si usás IVA
    const total = subtotal + tax;

    const invoice = this.invoiceRepo.create({
      user,
      branch,
      customer,
      subtotal,
      company,
      tax,
      total,
      note,
      status: InvoiceStatus.ISSUED,
      invoiceNumber: `F-${Date.now()}`,
    });

    const savedInvoice = await this.invoiceRepo.save(invoice);

    const itemEntities = items.map((item) => {
      return this.itemRepo.create({
        invoice: savedInvoice,
        product: { id: item.productId } as ProductEntity,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      });
    });

    await this.itemRepo.save(itemEntities);

    // 🔻 Actualizar inventario: descontar stock
    const movementType = await this.stockMovementTypeRepo.findOneByOrFail({
      name: 'venta',
    });
    for (const item of items) {
      const inventory = await this.inventoryRepo.findOne({
        where: {
          product: { id: item.productId },
          branch: { id: branchId },
        },
        relations: ['product', 'branch'],
      });

      if (!inventory) {
        throw new Error(
          `No hay inventario registrado para el producto ${item.productId} en la sucursal ${branchId}`,
        );
      }

      if (inventory.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para el producto ${item.productId}. Stock actual: ${inventory.stock}, requerido: ${item.quantity}`,
        );
      }

      inventory.stock -= item.quantity;

      await this.inventoryRepo.save(inventory);

      // Aquí podrías crear un movimiento de stock si lo deseas
      const stockMovement = this.stockMovementRepo.create({
        quantity: -item.quantity,
        reference: savedInvoice.invoiceNumber,
        note: `Descuento de stock por factura ${savedInvoice.invoiceNumber}`,
        movementType,
        branch,
        user,
        product: inventory.product,
      });

      await this.stockMovementRepo.save(stockMovement);
    }

    return savedInvoice;
  }

  async getInvoicesByCompany(companyId: string): Promise<InvoiceEntity[]> {
    return this.invoiceRepo.find({
      where: {
        company: { id: companyId },
      },
      relations: [
        'customer',
        'branch',
        'user',
        'items',
        'items.product',
        'company',
      ], // relaciones útiles
      order: { createdAt: 'DESC' },
    });
  }
}
