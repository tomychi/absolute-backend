import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { InventoryService } from '../services/inventory.service';
import { InventorySearchDto } from '../dto/inventory-search.dto';
import { InventoryResponseDto } from '../dto/inventory-response.dto';
import {
  StockAdjustmentDto,
  BulkStockAdjustmentDto,
} from '../dto/stock-adjustment.dto';
import { InventoryStatsDto } from '../dto/inventory-stats.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('branches/:branchId/inventory')
  @ApiOperation({
    summary: 'Get branch inventory',
    description:
      'Get inventory for a specific branch with search and pagination.',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch ID',
    example: 'uuid-branch-id',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for product name or SKU',
  })
  @ApiQuery({
    name: 'productId',
    required: false,
    description: 'Filter by product ID',
  })
  @ApiQuery({
    name: 'lowStock',
    required: false,
    description: 'Filter low stock products',
  })
  @ApiQuery({
    name: 'needsRestock',
    required: false,
    description: 'Filter products needing restock',
  })
  @ApiQuery({
    name: 'outOfStock',
    required: false,
    description: 'Filter out of stock products',
  })
  @ApiQuery({
    name: 'stockStatus',
    required: false,
    description: 'Filter by stock status',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (ASC/DESC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to branch',
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found',
  })
  async findByBranch(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Query() searchDto: InventorySearchDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const result = await this.inventoryService.findByBranch(
      branchId,
      searchDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      result,
      'Inventory retrieved successfully',
    );
  }

  @Get('products/:productId/inventory')
  @ApiOperation({
    summary: 'Get product inventory across branches',
    description:
      'Get inventory for a specific product across all branches in the company.',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID',
    example: 'uuid-product-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Product inventory retrieved successfully',
    type: [InventoryResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to product company',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InventoryResponseDto[]>> {
    const inventory = await this.inventoryService.findByProduct(
      productId,
      req.user.id,
    );

    return ApiResponseHelper.success(
      inventory,
      'Product inventory retrieved successfully',
    );
  }

  @Post('branches/:branchId/inventory/adjust')
  @ApiOperation({
    summary: 'Adjust stock quantity',
    description:
      'Adjust stock quantity for a specific product in a branch. User must have owner, admin or manager role.',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch ID',
    example: 'uuid-branch-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock adjusted successfully',
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
    description: 'Branch or product not found',
  })
  async adjustStock(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Body() adjustmentDto: StockAdjustmentDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const result = await this.inventoryService.adjustStock(
      branchId,
      adjustmentDto,
      req.user.id,
    );

    return ApiResponseHelper.success(result, 'Stock adjusted successfully');
  }

  @Post('inventory/bulk-adjust')
  @ApiOperation({
    summary: 'Bulk adjust stock quantities',
    description:
      'Adjust stock quantities for multiple products in a branch. User must have owner, admin or manager role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk stock adjustment completed',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  async bulkAdjustStock(
    @Body() bulkAdjustmentDto: BulkStockAdjustmentDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const result = await this.inventoryService.bulkAdjustStock(
      bulkAdjustmentDto,
      req.user.id,
    );

    return ApiResponseHelper.success(result, 'Bulk stock adjustment completed');
  }

  @Post('branches/:branchId/inventory/:productId/reserve')
  @ApiOperation({
    summary: 'Reserve stock',
    description:
      'Reserve stock for a specific product in a branch (e.g., for pending orders).',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch ID',
    example: 'uuid-branch-id',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID',
    example: 'uuid-product-id',
  })
  @ApiQuery({
    name: 'quantity',
    description: 'Quantity to reserve',
    example: '5',
  })
  @ApiQuery({
    name: 'referenceId',
    required: false,
    description: 'Reference ID (order, invoice, etc.)',
    example: 'uuid-order-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock reserved successfully',
    type: InventoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - insufficient available stock',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to branch',
  })
  async reserveStock(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('quantity') quantity: string,
    @Query('referenceId') referenceId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InventoryResponseDto>> {
    const result = await this.inventoryService.reserveStock(
      branchId,
      productId,
      parseFloat(quantity),
      req.user.id,
      referenceId,
    );

    return ApiResponseHelper.success(result, 'Stock reserved successfully');
  }

  @Post('branches/:branchId/inventory/:productId/release')
  @ApiOperation({
    summary: 'Release reserved stock',
    description:
      'Release previously reserved stock for a specific product in a branch.',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch ID',
    example: 'uuid-branch-id',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID',
    example: 'uuid-product-id',
  })
  @ApiQuery({
    name: 'quantity',
    description: 'Quantity to release',
    example: '5',
  })
  @ApiResponse({
    status: 200,
    description: 'Reserved stock released successfully',
    type: InventoryResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to branch',
  })
  async releaseReservation(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query('quantity') quantity: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InventoryResponseDto>> {
    const result = await this.inventoryService.releaseReservation(
      branchId,
      productId,
      parseFloat(quantity),
      req.user.id,
    );

    return ApiResponseHelper.success(
      result,
      'Reserved stock released successfully',
    );
  }

  @Get('companies/:companyId/inventory/stats')
  @ApiOperation({
    summary: 'Get inventory statistics',
    description: 'Get comprehensive inventory statistics for a company.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory statistics retrieved successfully',
    type: InventoryStatsDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to company',
  })
  async getInventoryStats(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InventoryStatsDto>> {
    const stats = await this.inventoryService.getCompanyInventoryStats(
      companyId,
      req.user.id,
    );

    return ApiResponseHelper.success(
      stats,
      'Inventory statistics retrieved successfully',
    );
  }

  @Get('companies/:companyId/inventory/low-stock')
  @ApiOperation({
    summary: 'Get low stock products',
    description:
      'Get products with low stock across all branches for a company.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Low stock products retrieved successfully',
    type: [InventoryResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to company',
  })
  async getLowStockProducts(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InventoryResponseDto[]>> {
    const lowStockProducts = await this.inventoryService.getLowStockProducts(
      companyId,
      req.user.id,
    );

    return ApiResponseHelper.success(
      lowStockProducts,
      'Low stock products retrieved successfully',
    );
  }

  @Get('companies/:companyId/inventory/restock-needed')
  @ApiOperation({
    summary: 'Get products needing restock',
    description:
      'Get products that need restocking across all branches for a company.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Products needing restock retrieved successfully',
    type: [InventoryResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to company',
  })
  async getRestockNeededProducts(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InventoryResponseDto[]>> {
    const restockNeededProducts =
      await this.inventoryService.getRestockNeededProducts(
        companyId,
        req.user.id,
      );

    return ApiResponseHelper.success(
      restockNeededProducts,
      'Products needing restock retrieved successfully',
    );
  }
}
