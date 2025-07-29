import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import {
  StockMovement,
  StockMovementType,
} from '../entities/stock-movement.entity';
import { Inventory } from '../entities/inventory.entity';
import { Product } from '../../products/entities/product.entity';
import { Branch } from '../../branches/entities/branch.entity';
import {
  UserCompany,
  UserCompanyStatus,
} from '../../user-companies/entities/user-company.entity';
import {
  CreateStockMovementDto,
  StockMovementResponseDto,
} from '../dto/stock-movement.dto';
import { InventoryService } from './inventory.service';

export interface PaginatedMovementsResponse {
  movements: StockMovementResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MovementSearchDto {
  page?: number;
  limit?: number;
  search?: string;
  branchId?: string;
  productId?: string;
  type?: StockMovementType;
  userId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

@Injectable()
export class StockMovementsService {
  constructor(
    @InjectRepository(StockMovement)
    private readonly stockMovementRepository: Repository<StockMovement>,
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
    private readonly inventoryService: InventoryService,
  ) {}

  /**
   * Create a stock movement (purchase, sale, adjustment, etc.)
   */
  async create(
    createMovementDto: CreateStockMovementDto,
    userId: string,
  ): Promise<{ movement: StockMovementResponseDto; inventory: any }> {
    const {
      branchId,
      productId,
      quantity,
      type,
      referenceId,
      notes,
      costPerUnit,
    } = createMovementDto;

    // Verify user has access to this branch
    await this.validateBranchAccess(userId, branchId);

    // Verify the product exists
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Use inventory service to update stock and create movement
    const result = await this.inventoryService.updateStock(
      branchId,
      productId,
      quantity,
      type,
      userId,
      {
        referenceId,
        notes,
        costPerUnit,
      },
    );

    // Format the movement response
    const movement = await this.stockMovementRepository.findOne({
      where: { id: result.movement.id },
      relations: ['branch', 'product', 'user'],
    });

    return {
      movement: StockMovementResponseDto.fromEntity(movement!),
      inventory: result.inventory,
    };
  }

  /**
   * Quick methods for common movement types
   */
  async createPurchase(
    branchId: string,
    productId: string,
    quantity: number,
    costPerUnit: number,
    userId: string,
    options: {
      referenceId?: string;
      notes?: string;
    } = {},
  ): Promise<{ movement: StockMovementResponseDto; inventory: any }> {
    return this.create(
      {
        branchId,
        productId,
        quantity: Math.abs(quantity), // Ensure positive for purchase
        type: StockMovementType.PURCHASE,
        costPerUnit,
        referenceId: options.referenceId,
        notes: options.notes || 'Purchase from supplier',
      },
      userId,
    );
  }

  async createSale(
    branchId: string,
    productId: string,
    quantity: number,
    userId: string,
    options: {
      referenceId?: string;
      notes?: string;
    } = {},
  ): Promise<{ movement: StockMovementResponseDto; inventory: any }> {
    return this.create(
      {
        branchId,
        productId,
        quantity: -Math.abs(quantity), // Ensure negative for sale
        type: StockMovementType.SALE,
        referenceId: options.referenceId,
        notes: options.notes || 'Sale to customer',
      },
      userId,
    );
  }

  async createInitialStock(
    branchId: string,
    productId: string,
    quantity: number,
    costPerUnit: number,
    userId: string,
    notes?: string,
  ): Promise<{ movement: StockMovementResponseDto; inventory: any }> {
    return this.create(
      {
        branchId,
        productId,
        quantity: Math.abs(quantity),
        type: StockMovementType.INITIAL,
        costPerUnit,
        notes: notes || 'Initial stock setup',
      },
      userId,
    );
  }

  /**
   * Find stock movements with filtering and pagination
   */
  async findMovements(
    searchDto: MovementSearchDto,
    userId: string,
    companyId?: string,
  ): Promise<PaginatedMovementsResponse> {
    const {
      page = 1,
      limit = 20,
      search,
      branchId,
      productId,
      type,
      userId: movementUserId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = searchDto;

    // Build query
    const query = this.stockMovementRepository
      .createQueryBuilder('movement')
      .leftJoinAndSelect('movement.branch', 'branch')
      .leftJoinAndSelect('movement.product', 'product')
      .leftJoinAndSelect('movement.user', 'user');

    // If companyId provided, filter by company branches
    if (companyId) {
      await this.validateCompanyAccess(userId, companyId);
      query.andWhere('branch.companyId = :companyId', { companyId });
    }

    // If branchId provided, validate access and filter
    if (branchId) {
      await this.validateBranchAccess(userId, branchId);
      query.andWhere('movement.branchId = :branchId', { branchId });
    }

    // Apply other filters
    if (productId) {
      query.andWhere('movement.productId = :productId', { productId });
    }

    if (type) {
      query.andWhere('movement.type = :type', { type });
    }

    if (movementUserId) {
      query.andWhere('movement.userId = :movementUserId', { movementUserId });
    }

    if (search) {
      query.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.sku) LIKE LOWER(:search) OR LOWER(movement.notes) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    // Date range filter
    if (startDate && endDate) {
      query.andWhere('movement.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    } else if (startDate) {
      query.andWhere('movement.createdAt >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      query.andWhere('movement.createdAt <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    // Apply sorting
    const allowedSortFields = ['createdAt', 'quantity', 'type', 'productName'];
    let orderField = 'movement.createdAt';

    if (sortBy === 'quantity') {
      orderField = 'movement.quantity';
    } else if (sortBy === 'type') {
      orderField = 'movement.type';
    } else if (sortBy === 'productName') {
      orderField = 'product.name';
    }

    query.orderBy(orderField, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    const [movements, total] = await query.getManyAndCount();

    return {
      movements: movements.map((movement) =>
        StockMovementResponseDto.fromEntity(movement),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get movements for a specific branch
   */
  async findByBranch(
    branchId: string,
    searchDto: MovementSearchDto,
    userId: string,
  ): Promise<PaginatedMovementsResponse> {
    return this.findMovements({ ...searchDto, branchId }, userId);
  }

  /**
   * Get movements for a specific product
   */
  async findByProduct(
    productId: string,
    searchDto: MovementSearchDto,
    userId: string,
  ): Promise<PaginatedMovementsResponse> {
    // Get product to validate company access
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.validateCompanyAccess(userId, product.companyId);

    return this.findMovements(
      { ...searchDto, productId },
      userId,
      product.companyId,
    );
  }

  /**
   * Get movements for a company
   */
  async findByCompany(
    companyId: string,
    searchDto: MovementSearchDto,
    userId: string,
  ): Promise<PaginatedMovementsResponse> {
    return this.findMovements(searchDto, userId, companyId);
  }

  /**
   * Get movement by ID
   */
  async findById(
    movementId: string,
    userId: string,
  ): Promise<StockMovementResponseDto> {
    const movement = await this.stockMovementRepository.findOne({
      where: { id: movementId },
      relations: ['branch', 'product', 'user'],
    });

    if (!movement) {
      throw new NotFoundException('Stock movement not found');
    }

    // Validate access to the branch's company
    await this.validateBranchAccess(userId, movement.branchId);

    return StockMovementResponseDto.fromEntity(movement);
  }

  /**
   * Get movement statistics
   */
  async getMovementStats(
    companyId: string,
    userId: string,
    days: number = 30,
  ): Promise<any> {
    await this.validateCompanyAccess(userId, companyId);

    // Get company branches
    const branches = await this.branchRepository.find({
      where: { companyId, isActive: true },
    });

    const branchIds = branches.map((b) => b.id);

    if (branchIds.length === 0) {
      return {
        totalMovements: 0,
        byType: {},
        byDay: [],
        topProducts: [],
      };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get movements in date range
    const movements = await this.stockMovementRepository.find({
      where: {
        branchId: In(branchIds),
        createdAt: Between(startDate, new Date()),
      },
      relations: ['product', 'branch'],
    });

    // Calculate stats
    const stats = {
      totalMovements: movements.length,
      byType: {} as Record<StockMovementType, number>,
      byDay: [] as Array<{
        date: string;
        movements: number;
        inbound: number;
        outbound: number;
      }>,
      topProducts: [] as Array<{
        productId: string;
        name: string;
        movements: number;
      }>,
    };

    // Count by type
    Object.values(StockMovementType).forEach((type) => {
      stats.byType[type] = movements.filter((m) => m.type === type).length;
    });

    // Group by day
    const dayMap = new Map();
    movements.forEach((movement) => {
      const day = movement.createdAt.toISOString().split('T')[0];
      if (!dayMap.has(day)) {
        dayMap.set(day, { movements: 0, inbound: 0, outbound: 0 });
      }
      const dayStats = dayMap.get(day);
      dayStats.movements++;
      if (movement.isInbound) {
        dayStats.inbound++;
      } else {
        dayStats.outbound++;
      }
    });

    stats.byDay = Array.from(dayMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top products by movement count
    const productMap = new Map();
    movements.forEach((movement) => {
      const key = movement.productId;
      if (!productMap.has(key)) {
        productMap.set(key, {
          productId: movement.productId,
          name: movement.product.name,
          movements: 0,
        });
      }
      productMap.get(key).movements++;
    });

    stats.topProducts = Array.from(productMap.values())
      .sort((a, b) => b.movements - a.movements)
      .slice(0, 10);

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
