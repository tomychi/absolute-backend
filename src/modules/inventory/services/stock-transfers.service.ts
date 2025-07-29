import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  StockTransfer,
  StockTransferStatus,
} from '../entities/stock-transfer.entity';
import { StockTransferItem } from '../entities/stock-transfer-item.entity';
import { Inventory } from '../entities/inventory.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Product } from '../../products/entities/product.entity';
import {
  UserCompany,
  UserCompanyStatus,
} from '../../user-companies/entities/user-company.entity';
import {
  CreateStockTransferDto,
  UpdateStockTransferDto,
  StockTransferResponseDto,
} from '../dto/stock-transfer.dto';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementType } from '../entities/stock-movement.entity';

export interface PaginatedTransfersResponse {
  transfers: StockTransferResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransferSearchDto {
  page?: number;
  limit?: number;
  search?: string;
  fromBranchId?: string;
  toBranchId?: string;
  status?: StockTransferStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class StockTransfersService {
  constructor(
    @InjectRepository(StockTransfer)
    private readonly transferRepository: Repository<StockTransfer>,
    @InjectRepository(StockTransferItem)
    private readonly transferItemRepository: Repository<StockTransferItem>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
    private readonly stockMovementsService: StockMovementsService,
  ) {}

  /**
   * Create a new stock transfer
   */
  async create(
    createTransferDto: CreateStockTransferDto,
    userId: string,
  ): Promise<StockTransferResponseDto> {
    const { fromBranchId, toBranchId, items, transferDate, notes } =
      createTransferDto;

    // Validate branches exist and belong to same company
    const [fromBranch, toBranch] = await Promise.all([
      this.branchRepository.findOne({ where: { id: fromBranchId } }),
      this.branchRepository.findOne({ where: { id: toBranchId } }),
    ]);

    if (!fromBranch || !toBranch) {
      throw new NotFoundException('Source or destination branch not found');
    }

    if (fromBranchId === toBranchId) {
      throw new BadRequestException(
        'Source and destination branches cannot be the same',
      );
    }

    if (fromBranch.companyId !== toBranch.companyId) {
      throw new BadRequestException('Branches must belong to the same company');
    }

    // Verify user has access
    await this.validateCompanyAccess(userId, fromBranch.companyId, [
      'owner',
      'admin',
      'manager',
    ]);

    // Validate all products exist and have sufficient stock
    const productIds = items.map((item) => item.productId);
    const products = await this.productRepository.find({
      where: { id: In(productIds) },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products not found');
    }

    // Check stock availability in source branch
    for (const item of items) {
      const inventory = await this.inventoryRepository.findOne({
        where: { branchId: fromBranchId, productId: item.productId },
        relations: ['product'],
      });

      if (!inventory || inventory.availableQuantity < item.quantity) {
        const product = products.find((p) => p.id === item.productId);
        throw new BadRequestException(
          `Insufficient stock for ${product?.name || 'product'}. Available: ${inventory?.availableQuantity || 0}, Required: ${item.quantity}`,
        );
      }
    }

    // Create transfer
    const transfer = this.transferRepository.create({
      fromBranchId,
      toBranchId,
      userId,
      status: StockTransferStatus.PENDING,
      transferDate: transferDate ? new Date(transferDate) : new Date(),
      notes,
    });

    const savedTransfer = await this.transferRepository.save(transfer);

    // Create transfer items
    const transferItems = items.map((item) =>
      this.transferItemRepository.create({
        transferId: savedTransfer.id,
        productId: item.productId,
        quantity: item.quantity,
        unitCost: item.unitCost,
      }),
    );

    await this.transferItemRepository.save(transferItems);

    // Reserve stock in source branch
    for (const item of items) {
      await this.inventoryRepository
        .createQueryBuilder()
        .update(Inventory)
        .set({
          reservedQuantity: () => `reserved_quantity + ${item.quantity}`,
        })
        .where('branchId = :branchId AND productId = :productId', {
          branchId: fromBranchId,
          productId: item.productId,
        })
        .execute();
    }

    return this.findById(savedTransfer.id, userId);
  }

  /**
   * Find transfers with filtering and pagination
   */
  async findTransfers(
    searchDto: TransferSearchDto,
    userId: string,
    companyId?: string,
  ): Promise<PaginatedTransfersResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      fromBranchId,
      toBranchId,
      status,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = searchDto;

    const query = this.transferRepository
      .createQueryBuilder('transfer')
      .leftJoinAndSelect('transfer.fromBranch', 'fromBranch')
      .leftJoinAndSelect('transfer.toBranch', 'toBranch')
      .leftJoinAndSelect('transfer.user', 'user')
      .leftJoinAndSelect('transfer.items', 'items')
      .leftJoinAndSelect('items.product', 'product');

    // If companyId provided, filter by company branches
    if (companyId) {
      await this.validateCompanyAccess(userId, companyId);
      query.andWhere('fromBranch.companyId = :companyId', { companyId });
    }

    // Apply filters
    if (fromBranchId) {
      await this.validateBranchAccess(userId, fromBranchId);
      query.andWhere('transfer.fromBranchId = :fromBranchId', { fromBranchId });
    }

    if (toBranchId) {
      await this.validateBranchAccess(userId, toBranchId);
      query.andWhere('transfer.toBranchId = :toBranchId', { toBranchId });
    }

    if (status) {
      query.andWhere('transfer.status = :status', { status });
    }

    if (search) {
      query.andWhere(
        '(LOWER(fromBranch.name) LIKE LOWER(:search) OR LOWER(toBranch.name) LIKE LOWER(:search) OR LOWER(transfer.notes) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Date range filter
    if (startDate && endDate) {
      query.andWhere('transfer.transferDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      query.andWhere('transfer.transferDate >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      query.andWhere('transfer.transferDate <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    // Apply sorting
    const allowedSortFields = ['createdAt', 'transferDate', 'status'];
    const orderField = allowedSortFields.includes(sortBy)
      ? `transfer.${sortBy}`
      : 'transfer.createdAt';
    query.orderBy(orderField, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    const [transfers, total] = await query.getManyAndCount();

    return {
      transfers: transfers.map((transfer) =>
        StockTransferResponseDto.fromEntity(transfer),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find transfer by ID
   */
  async findById(
    transferId: string,
    userId: string,
  ): Promise<StockTransferResponseDto> {
    const transfer = await this.transferRepository.findOne({
      where: { id: transferId },
      relations: [
        'fromBranch',
        'toBranch',
        'user',
        'completedByUser',
        'items',
        'items.product',
      ],
    });

    if (!transfer) {
      throw new NotFoundException('Stock transfer not found');
    }

    // Validate access
    await this.validateBranchAccess(userId, transfer.fromBranchId);

    return StockTransferResponseDto.fromEntity(transfer);
  }

  /**
   * Update transfer (only for pending transfers)
   */
  async update(
    transferId: string,
    updateTransferDto: UpdateStockTransferDto,
    userId: string,
  ): Promise<StockTransferResponseDto> {
    const transfer = await this.transferRepository.findOne({
      where: { id: transferId },
      relations: ['items'],
    });

    if (!transfer) {
      throw new NotFoundException('Stock transfer not found');
    }

    if (transfer.status !== StockTransferStatus.PENDING) {
      throw new BadRequestException('Can only update pending transfers');
    }

    // Validate access
    await this.validateBranchAccess(userId, transfer.fromBranchId, [
      'owner',
      'admin',
      'manager',
    ]);

    // Update transfer
    Object.assign(transfer, updateTransferDto);
    if (updateTransferDto.transferDate) {
      transfer.transferDate = new Date(updateTransferDto.transferDate);
    }

    await this.transferRepository.save(transfer);

    return this.findById(transferId, userId);
  }

  /**
   * Send transfer (change status to in_transit)
   */
  async sendTransfer(
    transferId: string,
    userId: string,
  ): Promise<StockTransferResponseDto> {
    const transfer = await this.transferRepository.findOne({
      where: { id: transferId },
      relations: ['items', 'items.product'],
    });

    if (!transfer) {
      throw new NotFoundException('Stock transfer not found');
    }

    if (transfer.status !== StockTransferStatus.PENDING) {
      throw new BadRequestException('Can only send pending transfers');
    }

    // Validate access
    await this.validateBranchAccess(userId, transfer.fromBranchId, [
      'owner',
      'admin',
      'manager',
    ]);

    // Remove stock from source branch and create outbound movements
    for (const item of transfer.items) {
      // Remove from inventory and reserved quantity
      await this.inventoryRepository
        .createQueryBuilder()
        .update(Inventory)
        .set({
          quantity: () => `quantity - ${item.quantity}`,
          reservedQuantity: () => `reserved_quantity - ${item.quantity}`,
        })
        .where('branchId = :branchId AND productId = :productId', {
          branchId: transfer.fromBranchId,
          productId: item.productId,
        })
        .execute();

      // Create outbound stock movement
      await this.stockMovementsService.create(
        {
          branchId: transfer.fromBranchId,
          productId: item.productId,
          quantity: -item.quantity,
          type: StockMovementType.TRANSFER_OUT,
          referenceId: transfer.id,
          notes: `Transfer to ${transfer.toBranch?.name || 'destination branch'}`,
          costPerUnit: item.unitCost,
        },
        userId,
      );
    }

    // Update transfer status
    transfer.status = StockTransferStatus.IN_TRANSIT;
    await this.transferRepository.save(transfer);

    return this.findById(transferId, userId);
  }

  /**
   * Complete transfer (receive at destination)
   */
  async completeTransfer(
    transferId: string,
    userId: string,
  ): Promise<StockTransferResponseDto> {
    const transfer = await this.transferRepository.findOne({
      where: { id: transferId },
      relations: ['items', 'items.product'],
    });

    if (!transfer) {
      throw new NotFoundException('Stock transfer not found');
    }

    if (transfer.status !== StockTransferStatus.IN_TRANSIT) {
      throw new BadRequestException(
        'Can only complete transfers that are in transit',
      );
    }

    // Validate access to destination branch
    await this.validateBranchAccess(userId, transfer.toBranchId, [
      'owner',
      'admin',
      'manager',
    ]);

    // Add stock to destination branch and create inbound movements
    for (const item of transfer.items) {
      // Add to destination inventory (or create if doesn't exist)
      const existingInventory = await this.inventoryRepository.findOne({
        where: { branchId: transfer.toBranchId, productId: item.productId },
      });

      if (existingInventory) {
        // Update existing inventory with weighted average cost
        const currentQuantity = Number(existingInventory.quantity);
        const currentCost = Number(existingInventory.averageCost || 0);
        const newQuantity = item.quantity;
        const newCost = Number(item.unitCost || 0);

        const totalQuantity = currentQuantity + newQuantity;
        const totalValue =
          currentQuantity * currentCost + newQuantity * newCost;
        const newAverageCost =
          totalQuantity > 0 ? totalValue / totalQuantity : newCost;

        await this.inventoryRepository.update(
          { id: existingInventory.id },
          {
            quantity: totalQuantity,
            averageCost: newAverageCost,
          },
        );
      } else {
        // Create new inventory record
        const newInventory = this.inventoryRepository.create({
          branchId: transfer.toBranchId,
          productId: item.productId,
          quantity: item.quantity,
          reservedQuantity: 0,
          averageCost: item.unitCost || 0,
        });
        await this.inventoryRepository.save(newInventory);
      }

      // Create inbound stock movement
      await this.stockMovementsService.create(
        {
          branchId: transfer.toBranchId,
          productId: item.productId,
          quantity: item.quantity,
          type: StockMovementType.TRANSFER_IN,
          referenceId: transfer.id,
          notes: `Transfer from ${transfer.fromBranch?.name || 'source branch'}`,
          costPerUnit: item.unitCost,
        },
        userId,
      );
    }

    // Update transfer status
    transfer.status = StockTransferStatus.COMPLETED;
    transfer.completedDate = new Date();
    transfer.completedBy = userId;
    await this.transferRepository.save(transfer);

    return this.findById(transferId, userId);
  }

  /**
   * Cancel transfer
   */
  async cancelTransfer(
    transferId: string,
    userId: string,
  ): Promise<StockTransferResponseDto> {
    const transfer = await this.transferRepository.findOne({
      where: { id: transferId },
      relations: ['items'],
    });

    if (!transfer) {
      throw new NotFoundException('Stock transfer not found');
    }

    if (!transfer.canBeCancelled) {
      throw new BadRequestException(
        'Transfer cannot be cancelled in its current status',
      );
    }

    // Validate access
    await this.validateBranchAccess(userId, transfer.fromBranchId, [
      'owner',
      'admin',
      'manager',
    ]);

    // If transfer was pending, release reserved stock
    if (transfer.status === StockTransferStatus.PENDING) {
      for (const item of transfer.items) {
        await this.inventoryRepository
          .createQueryBuilder()
          .update(Inventory)
          .set({
            reservedQuantity: () => `reserved_quantity - ${item.quantity}`,
          })
          .where('branchId = :branchId AND productId = :productId', {
            branchId: transfer.fromBranchId,
            productId: item.productId,
          })
          .execute();
      }
    }

    // Update transfer status
    transfer.status = StockTransferStatus.CANCELLED;
    await this.transferRepository.save(transfer);

    return this.findById(transferId, userId);
  }

  /**
   * Get transfer statistics for a company
   */
  async getTransferStats(
    companyId: string,
    userId: string,
    days: number = 30,
  ): Promise<any> {
    await this.validateCompanyAccess(userId, companyId);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get company branches
    const branches = await this.branchRepository.find({
      where: { companyId, isActive: true },
    });

    const branchIds = branches.map((b) => b.id);

    if (branchIds.length === 0) {
      return {
        totalTransfers: 0,
        byStatus: {},
        byBranch: {},
        recentTransfers: [],
      };
    }

    const transfers = await this.transferRepository.find({
      where: [{ fromBranchId: In(branchIds) }, { toBranchId: In(branchIds) }],
      relations: ['fromBranch', 'toBranch', 'items'],
    });

    const recentTransfers = transfers.filter((t) => t.createdAt >= startDate);

    const stats = {
      totalTransfers: transfers.length,
      recentTransfers: recentTransfers.length,
      byStatus: {} as Record<StockTransferStatus, number>,
      byBranch: {} as Record<string, { sent: number; received: number }>,
      topTransferRoutes: [] as Array<{
        from: string;
        to: string;
        count: number;
      }>,
    };

    // Count by status
    Object.values(StockTransferStatus).forEach((status) => {
      stats.byStatus[status] = transfers.filter(
        (t) => t.status === status,
      ).length;
    });

    // Count by branch
    branches.forEach((branch) => {
      stats.byBranch[branch.name] = {
        sent: transfers.filter((t) => t.fromBranchId === branch.id).length,
        received: transfers.filter((t) => t.toBranchId === branch.id).length,
      };
    });

    // Top transfer routes
    const routeMap = new Map();
    transfers.forEach((transfer) => {
      const route = `${transfer.fromBranch?.name} → ${transfer.toBranch?.name}`;
      routeMap.set(route, (routeMap.get(route) || 0) + 1);
    });

    stats.topTransferRoutes = Array.from(routeMap.entries())
      .map(([route, count]) => {
        const [from, to] = route.split(' → ');
        return { from, to, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return stats;
  }

  // Private helper methods

  private async validateBranchAccess(
    userId: string,
    branchId: string,
    requiredRoles?: string[],
  ): Promise<void> {
    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    await this.validateCompanyAccess(userId, branch.companyId, requiredRoles);
  }

  private async validateCompanyAccess(
    userId: string,
    companyId: string,
    requiredRoles?: string[],
  ): Promise<UserCompany> {
    const userCompany = await this.userCompanyRepository.findOne({
      where: {
        userId,
        companyId,
        isActiveField: true,
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
}
