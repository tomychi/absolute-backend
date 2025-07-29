import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Inventory } from '../entities/inventory.entity';
import {
  StockMovement,
  StockMovementType,
} from '../entities/stock-movement.entity';
import { Product } from '../../products/entities/product.entity';
import { Branch } from '../../branches/entities/branch.entity';
import {
  UserCompany,
  UserCompanyStatus,
} from '../../user-companies/entities/user-company.entity';
import { InventoryResponseDto } from '../dto/inventory-response.dto';
import { InventorySearchDto } from '../dto/inventory-search.dto';
import {
  StockAdjustmentDto,
  BulkStockAdjustmentDto,
} from '../dto/stock-adjustment.dto';
import { InventoryStatsDto } from '../dto/inventory-stats.dto';

export interface PaginatedInventoryResponse {
  inventory: InventoryResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StockUpdateResult {
  inventory: InventoryResponseDto;
  movement: any; // StockMovementResponseDto
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
  ) {}

  /**
   * Get inventory for a specific branch with search and pagination
   */
  async findByBranch(
    branchId: string,
    searchDto: InventorySearchDto,
    userId: string,
  ): Promise<PaginatedInventoryResponse> {
    // Verify user has access to this branch's company
    await this.validateBranchAccess(userId, branchId);

    const {
      page = 1,
      limit = 10,
      search,
      productId,
      lowStock,
      needsRestock,
      outOfStock,
      stockStatus,
      sortBy = 'lastUpdated',
      sortOrder = 'DESC',
    } = searchDto;

    const query = this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .leftJoinAndSelect('inventory.branch', 'branch')
      .where('inventory.branchId = :branchId', { branchId });

    // Apply filters
    if (search) {
      query.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.sku) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (productId) {
      query.andWhere('inventory.productId = :productId', { productId });
    }

    if (outOfStock) {
      query.andWhere('inventory.quantity = 0');
    } else {
      // Apply other filters only if not filtering for out of stock
      if (lowStock) {
        query.andWhere('inventory.quantity <= product.minStockLevel');
      }

      if (needsRestock) {
        query.andWhere('inventory.quantity <= product.reorderPoint');
      }

      if (stockStatus) {
        switch (stockStatus) {
          case 'low_stock':
            query.andWhere(
              'inventory.quantity <= product.minStockLevel AND inventory.quantity > 0',
            );
            break;
          case 'needs_restock':
            query.andWhere(
              'inventory.quantity <= product.reorderPoint AND inventory.quantity > 0',
            );
            break;
          case 'in_stock':
            query.andWhere('inventory.quantity > product.minStockLevel');
            break;
        }
      }
    }

    // Apply sorting
    const allowedSortFields = ['quantity', 'lastUpdated', 'productName'];
    let orderField = 'inventory.lastUpdated';

    if (sortBy === 'quantity') {
      orderField = 'inventory.quantity';
    } else if (sortBy === 'productName') {
      orderField = 'product.name';
    }

    query.orderBy(orderField, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    const [inventoryRecords, total] = await query.getManyAndCount();

    return {
      inventory: inventoryRecords.map((record) =>
        InventoryResponseDto.fromEntity(record),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get inventory for a specific product across all branches in a company
   */
  async findByProduct(
    productId: string,
    userId: string,
  ): Promise<InventoryResponseDto[]> {
    // Get product to verify company access
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['company'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify user has access to this company
    await this.validateCompanyAccess(userId, product.companyId);

    const inventoryRecords = await this.inventoryRepository.find({
      where: { productId },
      relations: ['branch', 'product'],
      order: { branch: { name: 'ASC' } },
    });

    return inventoryRecords.map((record) =>
      InventoryResponseDto.fromEntity(record),
    );
  }

  /**
   * Get or create inventory record for a product in a branch
   */
  async getOrCreateInventory(
    branchId: string,
    productId: string,
  ): Promise<Inventory> {
    let inventory = await this.inventoryRepository.findOne({
      where: { branchId, productId },
      relations: ['branch', 'product'],
    });

    if (!inventory) {
      // Verify the branch and product exist and belong to the same company
      const [branch, product] = await Promise.all([
        this.branchRepository.findOne({ where: { id: branchId } }),
        this.productRepository.findOne({ where: { id: productId } }),
      ]);

      if (!branch || !product) {
        throw new NotFoundException('Branch or product not found');
      }

      if (branch.companyId !== product.companyId) {
        throw new BadRequestException(
          'Branch and product must belong to the same company',
        );
      }

      // Create new inventory record
      inventory = this.inventoryRepository.create({
        branchId,
        productId,
        quantity: 0,
        reservedQuantity: 0,
        averageCost: product.cost || 0,
      });

      inventory = await this.inventoryRepository.save(inventory);

      // Load relations
      inventory = await this.inventoryRepository.findOne({
        where: { id: inventory.id },
        relations: ['branch', 'product'],
      });
    }

    return inventory!;
  }

  /**
   * Update stock quantity with movement tracking
   */
  async updateStock(
    branchId: string,
    productId: string,
    quantity: number,
    type: StockMovementType,
    userId: string,
    options: {
      referenceId?: string;
      notes?: string;
      costPerUnit?: number;
    } = {},
  ): Promise<StockUpdateResult> {
    // Verify user has access
    await this.validateBranchAccess(userId, branchId);

    // Get or create inventory record
    const inventory = await this.getOrCreateInventory(branchId, productId);
    const previousQuantity = Number(inventory.quantity);

    // Validate the operation
    if (quantity < 0 && Math.abs(quantity) > Number(inventory.quantity)) {
      throw new BadRequestException(
        `Cannot remove ${Math.abs(quantity)} units. Only ${inventory.quantity} available.`,
      );
    }

    // Update inventory quantity
    const newQuantity = previousQuantity + quantity;
    inventory.quantity = Math.max(0, newQuantity);

    // Update average cost if it's an inbound movement with cost
    if (quantity > 0 && options.costPerUnit) {
      inventory.updateAverageCost(quantity, options.costPerUnit);
    }

    await this.inventoryRepository.save(inventory);

    // Create stock movement record
    const totalCost = options.costPerUnit
      ? Math.abs(quantity) * options.costPerUnit
      : undefined;

    const movement = this.stockMovementRepository.create({
      branchId,
      productId,
      userId,
      quantity,
      type,
      referenceId: options.referenceId,
      notes: options.notes,
      costPerUnit: options.costPerUnit,
      totalCost,
      previousQuantity,
      newQuantity: inventory.quantity,
    });

    const savedMovement = await this.stockMovementRepository.save(movement);

    // Load updated inventory with relations
    const updatedInventory = await this.inventoryRepository.findOne({
      where: { id: inventory.id },
      relations: ['branch', 'product'],
    });

    return {
      inventory: InventoryResponseDto.fromEntity(updatedInventory!),
      movement: savedMovement, // This will be properly formatted by the StockMovementsService
    };
  }

  /**
   * Adjust stock to a specific quantity
   */
  async adjustStock(
    branchId: string,
    adjustmentDto: StockAdjustmentDto,
    userId: string,
  ): Promise<StockUpdateResult> {
    // Verify user has access
    await this.validateBranchAccess(userId, branchId, [
      'owner',
      'admin',
      'manager',
    ]);

    const { productId, newQuantity, reason, costPerUnit } = adjustmentDto;

    // Get current inventory
    const inventory = await this.getOrCreateInventory(branchId, productId);
    const currentQuantity = Number(inventory.quantity);
    const difference = newQuantity - currentQuantity;

    if (difference === 0) {
      // No change needed
      return {
        inventory: InventoryResponseDto.fromEntity(inventory),
        movement: null,
      };
    }

    // Create adjustment movement
    const notes = reason ? `Stock adjustment: ${reason}` : 'Stock adjustment';

    return this.updateStock(
      branchId,
      productId,
      difference,
      StockMovementType.ADJUSTMENT,
      userId,
      {
        notes,
        costPerUnit,
      },
    );
  }

  /**
   * Bulk stock adjustments
   */
  async bulkAdjustStock(
    bulkAdjustmentDto: BulkStockAdjustmentDto,
    userId: string,
  ): Promise<{
    results: StockUpdateResult[];
    errors: Array<{ productId: string; error: string }>;
  }> {
    const { branchId, adjustments, notes } = bulkAdjustmentDto;

    // Verify user has access
    await this.validateBranchAccess(userId, branchId, [
      'owner',
      'admin',
      'manager',
    ]);

    const results: StockUpdateResult[] = [];
    const errors: Array<{ productId: string; error: string }> = [];

    for (const adjustment of adjustments) {
      try {
        const adjustmentWithNotes = {
          ...adjustment,
          reason: adjustment.reason || notes || 'Bulk stock adjustment',
        };

        const result = await this.adjustStock(
          branchId,
          adjustmentWithNotes,
          userId,
        );
        results.push(result);
      } catch (error) {
        errors.push({
          productId: adjustment.productId,
          error: error.message || 'Unknown error',
        });
      }
    }

    return { results, errors };
  }

  /**
   * Reserve stock for an order
   */
  async reserveStock(
    branchId: string,
    productId: string,
    quantity: number,
    userId: string,
    referenceId?: string,
  ): Promise<InventoryResponseDto> {
    // Verify user has access
    await this.validateBranchAccess(userId, branchId);

    const inventory = await this.getOrCreateInventory(branchId, productId);

    if (!inventory.canFulfill(quantity)) {
      throw new BadRequestException(
        `Cannot reserve ${quantity} units. Only ${inventory.availableQuantity} available.`,
      );
    }

    inventory.reserve(quantity);
    await this.inventoryRepository.save(inventory);

    const updatedInventory = await this.inventoryRepository.findOne({
      where: { id: inventory.id },
      relations: ['branch', 'product'],
    });

    return InventoryResponseDto.fromEntity(updatedInventory!);
  }

  /**
   * Release reserved stock
   */
  async releaseReservation(
    branchId: string,
    productId: string,
    quantity: number,
    userId: string,
  ): Promise<InventoryResponseDto> {
    // Verify user has access
    await this.validateBranchAccess(userId, branchId);

    const inventory = await this.getOrCreateInventory(branchId, productId);
    inventory.releaseReservation(quantity);
    await this.inventoryRepository.save(inventory);

    const updatedInventory = await this.inventoryRepository.findOne({
      where: { id: inventory.id },
      relations: ['branch', 'product'],
    });

    return InventoryResponseDto.fromEntity(updatedInventory!);
  }

  /**
   * Get inventory statistics for a company
   */
  async getCompanyInventoryStats(
    companyId: string,
    userId: string,
  ): Promise<InventoryStatsDto> {
    // Verify user has access to company
    await this.validateCompanyAccess(userId, companyId);

    // Get all branches for this company
    const branches = await this.branchRepository.find({
      where: { companyId, isActive: true },
    });

    const branchIds = branches.map((b) => b.id);

    if (branchIds.length === 0) {
      // Return empty stats if no branches
      return {
        totalProducts: 0,
        totalQuantity: 0,
        totalValue: 0,
        inStockProducts: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        needsRestockProducts: 0,
        byBranch: {},
        topProductsByValue: [],
        recentMovements: {
          todayMovements: 0,
          weekMovements: 0,
          monthMovements: 0,
        },
      };
    }

    // Get inventory data
    const inventoryRecords = await this.inventoryRepository.find({
      where: { branchId: In(branchIds) },
      relations: ['branch', 'product'],
    });

    // Calculate basic stats
    const totalProducts = new Set(inventoryRecords.map((i) => i.productId))
      .size;
    const totalQuantity = inventoryRecords.reduce(
      (sum, i) => sum + Number(i.quantity),
      0,
    );
    const totalValue = inventoryRecords.reduce(
      (sum, i) => sum + i.totalValue,
      0,
    );

    let inStockProducts = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    let needsRestockProducts = 0;

    // Count products by status (aggregate across branches)
    const productStatusMap = new Map<
      string,
      {
        totalQuantity: number;
        isLowStock: boolean;
        needsRestock: boolean;
      }
    >();

    inventoryRecords.forEach((inventory) => {
      const existing = productStatusMap.get(inventory.productId) || {
        totalQuantity: 0,
        isLowStock: false,
        needsRestock: false,
      };

      existing.totalQuantity += Number(inventory.quantity);
      existing.isLowStock = existing.isLowStock || inventory.isLowStock;
      existing.needsRestock = existing.needsRestock || inventory.needsRestock;

      productStatusMap.set(inventory.productId, existing);
    });

    productStatusMap.forEach((status) => {
      if (status.totalQuantity === 0) {
        outOfStockProducts++;
      } else if (status.needsRestock) {
        needsRestockProducts++;
      } else if (status.isLowStock) {
        lowStockProducts++;
      } else {
        inStockProducts++;
      }
    });

    // Calculate stats by branch
    const byBranch: Record<
      string,
      { products: number; quantity: number; value: number }
    > = {};

    branches.forEach((branch) => {
      const branchInventory = inventoryRecords.filter(
        (i) => i.branchId === branch.id,
      );
      byBranch[branch.name] = {
        products: branchInventory.length,
        quantity: branchInventory.reduce(
          (sum, i) => sum + Number(i.quantity),
          0,
        ),
        value: branchInventory.reduce((sum, i) => sum + i.totalValue, 0),
      };
    });

    // Get top products by value (aggregate across branches)
    const productValueMap = new Map<
      string,
      {
        name: string;
        quantity: number;
        value: number;
      }
    >();

    inventoryRecords.forEach((inventory) => {
      const existing = productValueMap.get(inventory.productId) || {
        name: inventory.product.name,
        quantity: 0,
        value: 0,
      };

      existing.quantity += Number(inventory.quantity);
      existing.value += inventory.totalValue;

      productValueMap.set(inventory.productId, existing);
    });

    const topProductsByValue = Array.from(productValueMap.entries())
      .map(([productId, data]) => ({
        productId,
        name: data.name,
        quantity: data.quantity,
        value: data.value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Get recent movements count
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [todayMovements, weekMovements, monthMovements] = await Promise.all([
      this.stockMovementRepository.count({
        where: {
          branchId: In(branchIds),
          createdAt: { $gte: today } as any,
        },
      }),
      this.stockMovementRepository.count({
        where: {
          branchId: In(branchIds),
          createdAt: { $gte: weekAgo } as any,
        },
      }),
      this.stockMovementRepository.count({
        where: {
          branchId: In(branchIds),
          createdAt: { $gte: monthAgo } as any,
        },
      }),
    ]);

    return {
      totalProducts,
      totalQuantity,
      totalValue,
      inStockProducts,
      lowStockProducts,
      outOfStockProducts,
      needsRestockProducts,
      byBranch,
      topProductsByValue,
      recentMovements: {
        todayMovements,
        weekMovements,
        monthMovements,
      },
    };
  }

  /**
   * Get low stock products across all branches for a company
   */
  async getLowStockProducts(
    companyId: string,
    userId: string,
  ): Promise<InventoryResponseDto[]> {
    // Verify user has access to company
    await this.validateCompanyAccess(userId, companyId);

    // Get all branches for this company
    const branches = await this.branchRepository.find({
      where: { companyId, isActive: true },
    });

    const branchIds = branches.map((b) => b.id);

    if (branchIds.length === 0) {
      return [];
    }

    const lowStockInventory = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .leftJoinAndSelect('inventory.branch', 'branch')
      .where('inventory.branchId IN (:...branchIds)', { branchIds })
      .andWhere('inventory.quantity <= product.minStockLevel')
      .orderBy('inventory.quantity', 'ASC')
      .getMany();

    return lowStockInventory.map((record) =>
      InventoryResponseDto.fromEntity(record),
    );
  }

  /**
   * Get products that need restocking across all branches for a company
   */
  async getRestockNeededProducts(
    companyId: string,
    userId: string,
  ): Promise<InventoryResponseDto[]> {
    // Verify user has access to company
    await this.validateCompanyAccess(userId, companyId);

    // Get all branches for this company
    const branches = await this.branchRepository.find({
      where: { companyId, isActive: true },
    });

    const branchIds = branches.map((b) => b.id);

    if (branchIds.length === 0) {
      return [];
    }

    const restockNeededInventory = await this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .leftJoinAndSelect('inventory.branch', 'branch')
      .where('inventory.branchId IN (:...branchIds)', { branchIds })
      .andWhere('inventory.quantity <= product.reorderPoint')
      .orderBy('inventory.quantity', 'ASC')
      .getMany();

    return restockNeededInventory.map((record) =>
      InventoryResponseDto.fromEntity(record),
    );
  }

  // Private helper methods

  /**
   * Validate user has access to a specific branch
   */
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

  /**
   * Validate user has access to a company
   */
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
