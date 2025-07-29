import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  ILike,
  Between,
  LessThanOrEqual,
} from 'typeorm';
import {
  Product,
  ProductType,
  ProductStatus,
  ProductUnit,
} from '../entities/product.entity';
import { Company } from '../../companies/entities/company.entity';
import {
  UserCompany,
  UserCompanyStatus,
} from '../../user-companies/entities/user-company.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductSearchDto } from '../dto/product-search.dto';
import { ProductResponseDto } from '../dto/product-response.dto';
import { ProductSummaryDto } from '../dto/product-summary.dto';
import {
  BulkUploadProductDto,
  BulkUploadResultDto,
} from '../dto/bulk-upload.dto';
import { ProductStatsDto } from '../dto/product-stats.dto';

export interface PaginatedProductsResponse {
  products: ProductResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
  ) {}

  /**
   * Create a new product for a company
   */
  async create(
    companyId: string,
    createProductDto: CreateProductDto,
    userId: string,
  ): Promise<ProductResponseDto> {
    // Verify user has permission to create products in this company
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

    // Check if SKU already exists in this company (if provided)
    if (createProductDto.sku) {
      const existingProduct = await this.productRepository.findOne({
        where: {
          companyId,
          sku: createProductDto.sku,
        },
      });

      if (existingProduct) {
        throw new ConflictException(
          `Product with SKU '${createProductDto.sku}' already exists in this company`,
        );
      }
    }

    // Validate business rules
    this.validateProductData(createProductDto);

    // Create product
    const product = this.productRepository.create({
      ...createProductDto,
      companyId,
      isActive: createProductDto.isActive ?? true,
      trackInventory: createProductDto.trackInventory ?? true,
      allowBackorder: createProductDto.allowBackorder ?? false,
      minStockLevel: createProductDto.minStockLevel ?? 0,
      reorderPoint: createProductDto.reorderPoint ?? 0,
      reorderQuantity: createProductDto.reorderQuantity ?? 0,
    });

    const savedProduct = await this.productRepository.save(product);

    // Load relations for response
    return this.findById(savedProduct.id);
  }

  /**
   * Find all products for a company with search and pagination
   */
  async findByCompany(
    companyId: string,
    searchDto: ProductSearchDto,
    userId: string,
  ): Promise<PaginatedProductsResponse> {
    // Verify user has access to this company
    await this.validateUserCompanyAccess(userId, companyId);

    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      unit,
      isActive,
      trackInventory,
      minPrice,
      maxPrice,
      lowStock,
      needsRestock,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = searchDto;

    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.company', 'company')
      .where('product.companyId = :companyId', { companyId });

    // Apply filters
    if (search) {
      query.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.sku) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (type) {
      query.andWhere('product.type = :type', { type });
    }

    if (status) {
      query.andWhere('product.status = :status', { status });
    }

    if (unit) {
      query.andWhere('product.unit = :unit', { unit });
    }

    if (typeof isActive === 'boolean') {
      query.andWhere('product.isActive = :isActive', { isActive });
    }

    if (typeof trackInventory === 'boolean') {
      query.andWhere('product.trackInventory = :trackInventory', {
        trackInventory,
      });
    }

    if (minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // TODO: Implement low stock and needs restock filters when inventory module is ready
    // These will require joins with inventory table

    // Apply sorting
    const allowedSortFields = [
      'name',
      'sku',
      'price',
      'cost',
      'type',
      'status',
      'createdAt',
      'updatedAt',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    query.orderBy(`product.${sortField}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    const [products, total] = await query.getManyAndCount();

    return {
      products: products.map((product) =>
        ProductResponseDto.fromEntity(product),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find product by ID
   */
  async findById(
    productId: string,
    userId?: string,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['company'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // If userId provided, validate access
    if (userId) {
      await this.validateUserCompanyAccess(userId, product.companyId);
    }

    return ProductResponseDto.fromEntity(product);
  }

  /**
   * Update product
   */
  async update(
    productId: string,
    updateProductDto: UpdateProductDto,
    userId: string,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['company'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(userId, product.companyId, [
      'owner',
      'admin',
      'manager',
    ]);

    // Validate business rules
    this.validateProductData(updateProductDto);

    // Update product
    Object.assign(product, updateProductDto);
    await this.productRepository.save(product);

    return this.findById(productId);
  }

  /**
   * Toggle product active status
   */
  async toggleStatus(
    productId: string,
    userId: string,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(userId, product.companyId, [
      'owner',
      'admin',
      'manager',
    ]);

    product.isActive = !product.isActive;

    // Update status based on active state
    if (!product.isActive && product.status === ProductStatus.ACTIVE) {
      product.status = ProductStatus.INACTIVE;
    } else if (product.isActive && product.status === ProductStatus.INACTIVE) {
      product.status = ProductStatus.ACTIVE;
    }

    await this.productRepository.save(product);

    return this.findById(productId);
  }

  /**
   * Update product status
   */
  async updateStatus(
    productId: string,
    status: ProductStatus,
    userId: string,
  ): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(userId, product.companyId, [
      'owner',
      'admin',
      'manager',
    ]);

    product.status = status;

    // Update active state based on status
    if (status === ProductStatus.ACTIVE) {
      product.isActive = true;
    } else if (
      status === ProductStatus.INACTIVE ||
      status === ProductStatus.DISCONTINUED
    ) {
      product.isActive = false;
    }

    await this.productRepository.save(product);

    return this.findById(productId);
  }

  /**
   * Soft delete product
   */
  async remove(productId: string, userId: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(userId, product.companyId, [
      'owner',
      'admin',
    ]);

    // TODO: Check for related data (inventory, invoice items, etc.)
    // This should be implemented when those modules are created

    await this.productRepository.softDelete(productId);
  }

  /**
   * Get product statistics for a company
   */
  async getCompanyProductStats(
    companyId: string,
    userId: string,
  ): Promise<ProductStatsDto> {
    // Verify user has access
    await this.validateUserCompanyAccess(userId, companyId);

    const products = await this.productRepository.find({
      where: { companyId },
    });

    const stats: ProductStatsDto = {
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.isActive).length,
      inactiveProducts: products.filter((p) => !p.isActive).length,
      byType: {
        [ProductType.PHYSICAL]: 0,
        [ProductType.DIGITAL]: 0,
        [ProductType.SERVICE]: 0,
        [ProductType.SUBSCRIPTION]: 0,
      },
      byStatus: {
        [ProductStatus.ACTIVE]: 0,
        [ProductStatus.INACTIVE]: 0,
        [ProductStatus.DISCONTINUED]: 0,
        [ProductStatus.OUT_OF_STOCK]: 0,
      },
      trackedProducts: products.filter((p) => p.trackInventory).length,
      untrackedProducts: products.filter((p) => !p.trackInventory).length,
      lowStockProducts: 0, // TODO: Implement when inventory module is ready
      needsRestockProducts: 0, // TODO: Implement when inventory module is ready
      totalInventoryValue: 0, // TODO: Calculate with inventory data
      averagePrice: 0,
      averageCost: 0,
      averageProfitMargin: 0,
    };

    // Count by type and status
    products.forEach((product) => {
      stats.byType[product.type]++;
      stats.byStatus[product.status]++;
    });

    // Calculate averages
    if (products.length > 0) {
      const totalPrice = products.reduce((sum, p) => sum + Number(p.price), 0);
      const totalCost = products.reduce(
        (sum, p) => sum + Number(p.cost || 0),
        0,
      );
      const productsWithCost = products.filter((p) => p.cost && p.cost > 0);

      stats.averagePrice = totalPrice / products.length;
      stats.averageCost =
        productsWithCost.length > 0 ? totalCost / productsWithCost.length : 0;

      if (stats.averageCost > 0) {
        stats.averageProfitMargin =
          ((stats.averagePrice - stats.averageCost) / stats.averageCost) * 100;
      }
    }

    return stats;
  }

  /**
   * Get product summaries for dropdown/selection
   */
  async getProductSummaries(
    companyId: string,
    userId: string,
    activeOnly: boolean = true,
    limit?: number,
  ): Promise<ProductSummaryDto[]> {
    // Verify user has access
    await this.validateUserCompanyAccess(userId, companyId);

    const whereCondition: FindOptionsWhere<Product> = { companyId };
    if (activeOnly) {
      whereCondition.isActive = true;
      whereCondition.status = ProductStatus.ACTIVE;
    }

    const queryOptions: any = {
      where: whereCondition,
      order: { name: 'ASC' },
    };

    if (limit) {
      queryOptions.take = limit;
    }

    const products = await this.productRepository.find(queryOptions);

    return products.map((product) => ProductSummaryDto.fromEntity(product));
  }

  /**
   * Generate unique SKU suggestion
   */
  async generateSkuSuggestion(
    companyId: string,
    productName: string,
    userId: string,
  ): Promise<string> {
    // Verify user has access
    await this.validateUserCompanyAccess(userId, companyId);

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    let suggestion = Product.generateSkuSuggestion(productName, company.name);
    let counter = 1;

    // Ensure uniqueness
    while (await this.isSkuExists(companyId, suggestion)) {
      const nameCode = productName
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      const companyCode = company.name
        .substring(0, 2)
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      suggestion = `${companyCode}${nameCode}${counter.toString().padStart(3, '0')}`;
      counter++;
    }

    return suggestion;
  }

  /**
   * Bulk upload products
   */
  async bulkUpload(
    companyId: string,
    bulkUploadDto: BulkUploadProductDto,
    userId: string,
  ): Promise<BulkUploadResultDto> {
    // Verify user has permission
    await this.validateUserCompanyAccess(userId, companyId, ['owner', 'admin']);

    const result: BulkUploadResultDto = {
      totalProcessed: bulkUploadDto.products.length,
      successCount: 0,
      updatedCount: 0,
      errorCount: 0,
      errors: [],
      createdIds: [],
      updatedIds: [],
    };

    for (let i = 0; i < bulkUploadDto.products.length; i++) {
      const productDto = bulkUploadDto.products[i];
      const rowNumber = productDto.rowNumber || i + 1;

      try {
        // Check if product exists (by SKU)
        let existingProduct: Product | null = null;
        if (productDto.sku) {
          existingProduct = await this.productRepository.findOne({
            where: { companyId, sku: productDto.sku },
          });
        }

        if (existingProduct && bulkUploadDto.updateExisting) {
          // Update existing product
          Object.assign(existingProduct, productDto);
          await this.productRepository.save(existingProduct);
          result.updatedCount++;
          result.updatedIds.push(existingProduct.id);
        } else if (existingProduct && !bulkUploadDto.updateExisting) {
          // SKU exists and update not allowed
          result.errors.push({
            row: rowNumber,
            error: `Product with SKU '${productDto.sku}' already exists`,
            sku: productDto.sku,
            name: productDto.name,
          });
          result.errorCount++;
        } else {
          // Create new product
          this.validateProductData(productDto);

          const product = this.productRepository.create({
            ...productDto,
            companyId,
          });

          const savedProduct = await this.productRepository.save(product);
          result.successCount++;
          result.createdIds.push(savedProduct.id);
        }
      } catch (error) {
        result.errors.push({
          row: rowNumber,
          error: error.message || 'Unknown error',
          sku: productDto.sku,
          name: productDto.name,
        });
        result.errorCount++;

        // If not skipping errors, stop processing
        if (!bulkUploadDto.skipErrors) {
          break;
        }
      }
    }

    return result;
  }

  /**
   * Search products by barcode
   */
  async findByBarcode(
    companyId: string,
    barcode: string,
    userId: string,
  ): Promise<ProductResponseDto | null> {
    // Verify user has access
    await this.validateUserCompanyAccess(userId, companyId);

    const product = await this.productRepository.findOne({
      where: { companyId, barcode },
      relations: ['company'],
    });

    return product ? ProductResponseDto.fromEntity(product) : null;
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

  /**
   * Validate product data for business rules
   */
  private validateProductData(productDto: Partial<CreateProductDto>): void {
    // Validate price and cost relationship
    if (
      productDto.price !== undefined &&
      productDto.cost !== undefined &&
      productDto.cost > productDto.price
    ) {
      throw new BadRequestException(
        'Cost cannot be greater than selling price',
      );
    }

    // Validate stock levels
    if (
      productDto.minStockLevel !== undefined &&
      productDto.maxStockLevel !== undefined
    ) {
      if (productDto.minStockLevel > productDto.maxStockLevel) {
        throw new BadRequestException(
          'Minimum stock level cannot be greater than maximum stock level',
        );
      }
    }

    if (
      productDto.reorderPoint !== undefined &&
      productDto.minStockLevel !== undefined
    ) {
      if (productDto.reorderPoint < productDto.minStockLevel) {
        throw new BadRequestException(
          'Reorder point should be at least equal to minimum stock level',
        );
      }
    }

    // Validate dimensions if provided
    if (productDto.dimensions) {
      const { length, width, height, weight } = productDto.dimensions;
      if (
        (length && length <= 0) ||
        (width && width <= 0) ||
        (height && height <= 0) ||
        (weight && weight <= 0)
      ) {
        throw new BadRequestException(
          'All dimension values must be greater than 0',
        );
      }
    }

    // Validate inventory tracking rules
    if (
      productDto.type === ProductType.DIGITAL ||
      productDto.type === ProductType.SERVICE
    ) {
      if (productDto.trackInventory === true) {
        throw new BadRequestException(
          'Digital products and services cannot have inventory tracking enabled',
        );
      }
    }
  }

  /**
   * Check if SKU exists in company
   */
  private async isSkuExists(companyId: string, sku: string): Promise<boolean> {
    const count = await this.productRepository.count({
      where: { companyId, sku },
    });
    return count > 0;
  }
}
