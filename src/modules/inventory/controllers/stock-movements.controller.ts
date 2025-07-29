import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  StockMovementsService,
  MovementSearchDto,
} from '../services/stock-movements.service';
import {
  CreateStockMovementDto,
  StockMovementResponseDto,
} from '../dto/stock-movement.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Stock Movements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post('stock-movements')
  @ApiOperation({
    summary: 'Create stock movement',
    description:
      'Create a new stock movement (purchase, sale, adjustment, etc.).',
  })
  @ApiResponse({
    status: 201,
    description: 'Stock movement created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or insufficient stock',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to branch',
  })
  @ApiResponse({
    status: 404,
    description: 'Branch or product not found',
  })
  async create(
    @Body() createMovementDto: CreateStockMovementDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const result = await this.stockMovementsService.create(
      createMovementDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      result,
      'Stock movement created successfully',
      HttpStatus.CREATED,
    );
  }

  @Post('stock-movements/purchase')
  @ApiOperation({
    summary: 'Create purchase movement',
    description: 'Quick method to create a purchase movement (adds stock).',
  })
  @ApiResponse({
    status: 201,
    description: 'Purchase movement created successfully',
  })
  async createPurchase(
    @Body()
    body: {
      branchId: string;
      productId: string;
      quantity: number;
      costPerUnit: number;
      referenceId?: string;
      notes?: string;
    },
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const { branchId, productId, quantity, costPerUnit, referenceId, notes } =
      body;

    const result = await this.stockMovementsService.createPurchase(
      branchId,
      productId,
      quantity,
      costPerUnit,
      req.user.id,
      { referenceId, notes },
    );

    return ApiResponseHelper.success(
      result,
      'Purchase movement created successfully',
      HttpStatus.CREATED,
    );
  }

  @Post('stock-movements/sale')
  @ApiOperation({
    summary: 'Create sale movement',
    description: 'Quick method to create a sale movement (removes stock).',
  })
  @ApiResponse({
    status: 201,
    description: 'Sale movement created successfully',
  })
  async createSale(
    @Body()
    body: {
      branchId: string;
      productId: string;
      quantity: number;
      referenceId?: string;
      notes?: string;
    },
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const { branchId, productId, quantity, referenceId, notes } = body;

    const result = await this.stockMovementsService.createSale(
      branchId,
      productId,
      quantity,
      req.user.id,
      { referenceId, notes },
    );

    return ApiResponseHelper.success(
      result,
      'Sale movement created successfully',
      HttpStatus.CREATED,
    );
  }

  @Post('stock-movements/initial-stock')
  @ApiOperation({
    summary: 'Set initial stock',
    description: 'Set initial stock for a product in a branch.',
  })
  @ApiResponse({
    status: 201,
    description: 'Initial stock set successfully',
  })
  async createInitialStock(
    @Body()
    body: {
      branchId: string;
      productId: string;
      quantity: number;
      costPerUnit: number;
      notes?: string;
    },
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const { branchId, productId, quantity, costPerUnit, notes } = body;

    const result = await this.stockMovementsService.createInitialStock(
      branchId,
      productId,
      quantity,
      costPerUnit,
      req.user.id,
      notes,
    );

    return ApiResponseHelper.success(
      result,
      'Initial stock set successfully',
      HttpStatus.CREATED,
    );
  }

  @Get('branches/:branchId/stock-movements')
  @ApiOperation({
    summary: 'Get branch stock movements',
    description:
      'Get stock movements for a specific branch with filtering and pagination.',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch ID',
    example: 'uuid-branch-id',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Movement type filter',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date filter (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date filter (YYYY-MM-DD)',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (ASC/DESC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock movements retrieved successfully',
  })
  async findByBranch(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Query() query: any,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const searchDto: MovementSearchDto = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      search: query.search,
      type: query.type,
      startDate: query.startDate,
      endDate: query.endDate,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
    };

    const result = await this.stockMovementsService.findByBranch(
      branchId,
      searchDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      result,
      'Stock movements retrieved successfully',
    );
  }

  @Get('products/:productId/stock-movements')
  @ApiOperation({
    summary: 'Get product stock movements',
    description:
      'Get stock movements for a specific product across all branches.',
  })
  @ApiParam({
    name: 'productId',
    description: 'Product ID',
    example: 'uuid-product-id',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({
    name: 'branchId',
    required: false,
    description: 'Filter by branch',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Movement type filter',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date filter',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date filter',
  })
  @ApiResponse({
    status: 200,
    description: 'Product stock movements retrieved successfully',
  })
  async findByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() query: any,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const searchDto: MovementSearchDto = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      branchId: query.branchId,
      type: query.type,
      startDate: query.startDate,
      endDate: query.endDate,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
    };

    const result = await this.stockMovementsService.findByProduct(
      productId,
      searchDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      result,
      'Product stock movements retrieved successfully',
    );
  }

  @Get('companies/:companyId/stock-movements')
  @ApiOperation({
    summary: 'Get company stock movements',
    description: 'Get stock movements for all branches in a company.',
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
    name: 'branchId',
    required: false,
    description: 'Filter by branch',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Movement type filter',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date filter',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date filter',
  })
  @ApiResponse({
    status: 200,
    description: 'Company stock movements retrieved successfully',
  })
  async findByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query() query: any,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const searchDto: MovementSearchDto = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      search: query.search,
      branchId: query.branchId,
      type: query.type,
      startDate: query.startDate,
      endDate: query.endDate,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
    };

    const result = await this.stockMovementsService.findByCompany(
      companyId,
      searchDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      result,
      'Company stock movements retrieved successfully',
    );
  }

  @Get('stock-movements/:id')
  @ApiOperation({
    summary: 'Get stock movement by ID',
    description: 'Get detailed information about a specific stock movement.',
  })
  @ApiParam({
    name: 'id',
    description: 'Stock movement ID',
    example: 'uuid-movement-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock movement retrieved successfully',
    type: StockMovementResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Stock movement not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<StockMovementResponseDto>> {
    const movement = await this.stockMovementsService.findById(id, req.user.id);

    return ApiResponseHelper.success(
      movement,
      'Stock movement retrieved successfully',
    );
  }

  @Get('companies/:companyId/stock-movements/stats')
  @ApiOperation({
    summary: 'Get stock movement statistics',
    description: 'Get statistics about stock movements for a company.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to analyze (default: 30)',
    example: '30',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock movement statistics retrieved successfully',
  })
  async getMovementStats(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 30,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const stats = await this.stockMovementsService.getMovementStats(
      companyId,
      req.user.id,
      days,
    );

    return ApiResponseHelper.success(
      stats,
      'Stock movement statistics retrieved successfully',
    );
  }
}
