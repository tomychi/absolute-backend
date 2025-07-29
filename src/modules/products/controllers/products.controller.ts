import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseEnumPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService } from '../services/products.service';
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
import { ProductStatus } from '../entities/product.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post('companies/:companyId/products')
  @ApiOperation({
    summary: 'Create new product',
    description:
      'Create a new product for a company. User must have owner, admin or manager role.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or business rule violation',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Product SKU already exists in company',
  })
  async create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() createProductDto: CreateProductDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<ProductResponseDto>> {
    const product = await this.productsService.create(
      companyId,
      createProductDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      product,
      'Product created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get('companies/:companyId/products')
  @ApiOperation({
    summary: 'Get company products',
    description: 'Get all products for a company with search and pagination.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Product type filter',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Product status filter',
  })
  @ApiQuery({
    name: 'unit',
    required: false,
    description: 'Product unit filter',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Active status filter',
  })
  @ApiQuery({
    name: 'trackInventory',
    required: false,
    description: 'Track inventory filter',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
  })
  @ApiQuery({
    name: 'lowStock',
    required: false,
    description: 'Low stock filter',
  })
  @ApiQuery({
    name: 'needsRestock',
    required: false,
    description: 'Needs restock filter',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (ASC/DESC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to company',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  async findByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query() searchDto: ProductSearchDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const result = await this.productsService.findByCompany(
      companyId,
      searchDto,
      req.user.id,
    );

    return ApiResponseHelper.success(result, 'Products retrieved successfully');
  }

  @Get('companies/:companyId/products/summaries')
  @ApiOperation({
    summary: 'Get product summaries',
    description:
      'Get simplified product information for dropdowns and selections.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description: 'Include only active products',
    type: Boolean,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of products to return',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Product summaries retrieved successfully',
    type: [ProductSummaryDto],
  })
  async getProductSummaries(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('activeOnly') activeOnly: string,
    @Query('limit') limit: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<ProductSummaryDto[]>> {
    const isActiveOnly = activeOnly === 'true';
    const limitNumber = limit ? parseInt(limit) : undefined;

    const summaries = await this.productsService.getProductSummaries(
      companyId,
      req.user.id,
      isActiveOnly,
      limitNumber,
    );

    return ApiResponseHelper.success(
      summaries,
      'Product summaries retrieved successfully',
    );
  }

  @Get('companies/:companyId/products/stats')
  @ApiOperation({
    summary: 'Get product statistics',
    description: 'Get statistics about products for a company.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product statistics retrieved successfully',
    type: ProductStatsDto,
  })
  async getProductStats(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<ProductStatsDto>> {
    const stats = await this.productsService.getCompanyProductStats(
      companyId,
      req.user.id,
    );

    return ApiResponseHelper.success(
      stats,
      'Product statistics retrieved successfully',
    );
  }

  @Get('companies/:companyId/products/generate-sku')
  @ApiOperation({
    summary: 'Generate product SKU suggestion',
    description:
      'Generate a unique SKU suggestion based on product name and company.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiQuery({
    name: 'productName',
    description: 'Product name to generate SKU for',
    example: 'Laptop Dell Inspiron',
  })
  @ApiResponse({
    status: 200,
    description: 'SKU suggestion generated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to company',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  async generateSkuSuggestion(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('productName') productName: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<{ suggestedSku: string }>> {
    const suggestedSku = await this.productsService.generateSkuSuggestion(
      companyId,
      productName,
      req.user.id,
    );

    return ApiResponseHelper.success(
      { suggestedSku },
      'SKU suggestion generated successfully',
    );
  }

  @Get('companies/:companyId/products/barcode/:barcode')
  @ApiOperation({
    summary: 'Find product by barcode',
    description: 'Search for a product using its barcode.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiParam({
    name: 'barcode',
    description: 'Product barcode',
    example: '1234567890123',
  })
  @ApiResponse({
    status: 200,
    description: 'Product found by barcode',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findByBarcode(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('barcode') barcode: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<ProductResponseDto | null>> {
    const product = await this.productsService.findByBarcode(
      companyId,
      barcode,
      req.user.id,
    );

    if (!product) {
      return ApiResponseHelper.success(
        null,
        'Product not found with the provided barcode',
        HttpStatus.NOT_FOUND,
      );
    }

    return ApiResponseHelper.success(product, 'Product found successfully');
  }

  @Post('companies/:companyId/products/bulk-upload')
  @ApiOperation({
    summary: 'Bulk upload products',
    description:
      'Upload multiple products at once. User must have owner or admin role.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk upload completed',
    type: BulkUploadResultDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async bulkUpload(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() bulkUploadDto: BulkUploadProductDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<BulkUploadResultDto>> {
    const result = await this.productsService.bulkUpload(
      companyId,
      bulkUploadDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      result,
      'Bulk upload completed successfully',
    );
  }

  @Get('products/:id')
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Get detailed information about a specific product.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'uuid-product-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to product company',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<ProductResponseDto>> {
    const product = await this.productsService.findById(id, req.user.id);

    return ApiResponseHelper.success(product, 'Product retrieved successfully');
  }

  @Patch('products/:id')
  @ApiOperation({
    summary: 'Update product',
    description:
      'Update product information. User must have owner, admin or manager role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'uuid-product-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<ProductResponseDto>> {
    const product = await this.productsService.update(
      id,
      updateProductDto,
      req.user.id,
    );

    return ApiResponseHelper.success(product, 'Product updated successfully');
  }

  @Patch('products/:id/toggle-status')
  @ApiOperation({
    summary: 'Toggle product status',
    description:
      'Activate or deactivate a product. User must have owner, admin or manager role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'uuid-product-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product status toggled successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<ProductResponseDto>> {
    const product = await this.productsService.toggleStatus(id, req.user.id);

    return ApiResponseHelper.success(
      product,
      'Product status toggled successfully',
    );
  }

  @Patch('products/:id/status/:status')
  @ApiOperation({
    summary: 'Update product status',
    description:
      'Set specific status for a product. User must have owner, admin or manager role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'uuid-product-id',
  })
  @ApiParam({
    name: 'status',
    description: 'New product status',
    enum: ProductStatus,
  })
  @ApiResponse({
    status: 200,
    description: 'Product status updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('status', new ParseEnumPipe(ProductStatus)) status: ProductStatus,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<ProductResponseDto>> {
    const product = await this.productsService.updateStatus(
      id,
      status,
      req.user.id,
    );

    return ApiResponseHelper.success(
      product,
      'Product status updated successfully',
    );
  }

  @Delete('products/:id')
  @ApiOperation({
    summary: 'Delete product',
    description: 'Soft delete a product. User must have owner or admin role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Product ID',
    example: 'uuid-product-id',
  })
  @ApiResponse({
    status: 204,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only owners and admins can delete products',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.productsService.remove(id, req.user.id);
  }
}
