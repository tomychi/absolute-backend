// src/modules/inventory/controllers/stock-transfers.controller.ts
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
  StockTransfersService,
  TransferSearchDto,
} from '../services/stock-transfers.service';
import {
  CreateStockTransferDto,
  UpdateStockTransferDto,
  StockTransferResponseDto,
} from '../dto/stock-transfer.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Stock Transfers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class StockTransfersController {
  constructor(private readonly stockTransfersService: StockTransfersService) {}

  @Post('stock-transfers')
  @ApiOperation({
    summary: 'Create stock transfer',
    description:
      'Create a new stock transfer between branches. User must have owner, admin or manager role.',
  })
  @ApiResponse({
    status: 201,
    description: 'Stock transfer created successfully',
    type: StockTransferResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or insufficient stock',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Branch or product not found',
  })
  async create(
    @Body() createTransferDto: CreateStockTransferDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<StockTransferResponseDto>> {
    const transfer = await this.stockTransfersService.create(
      createTransferDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      transfer,
      'Stock transfer created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get('companies/:companyId/stock-transfers')
  @ApiOperation({
    summary: 'Get company stock transfers',
    description:
      'Get stock transfers for all branches in a company with filtering and pagination.',
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
    name: 'fromBranchId',
    required: false,
    description: 'Filter by source branch',
  })
  @ApiQuery({
    name: 'toBranchId',
    required: false,
    description: 'Filter by destination branch',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by transfer status',
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
    description: 'Stock transfers retrieved successfully',
  })
  async findByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query() query: any,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const searchDto: TransferSearchDto = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      search: query.search,
      fromBranchId: query.fromBranchId,
      toBranchId: query.toBranchId,
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
    };

    const result = await this.stockTransfersService.findTransfers(
      searchDto,
      req.user.id,
      companyId,
    );

    return ApiResponseHelper.success(
      result,
      'Stock transfers retrieved successfully',
    );
  }

  @Get('branches/:branchId/stock-transfers/outbound')
  @ApiOperation({
    summary: 'Get outbound transfers from branch',
    description: 'Get stock transfers sent from a specific branch.',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch ID',
    example: 'uuid-branch-id',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Outbound transfers retrieved successfully',
  })
  async findOutboundByBranch(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Query() query: any,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const searchDto: TransferSearchDto = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      fromBranchId: branchId,
      status: query.status,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };

    const result = await this.stockTransfersService.findTransfers(
      searchDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      result,
      'Outbound transfers retrieved successfully',
    );
  }

  @Get('branches/:branchId/stock-transfers/inbound')
  @ApiOperation({
    summary: 'Get inbound transfers to branch',
    description: 'Get stock transfers received by a specific branch.',
  })
  @ApiParam({
    name: 'branchId',
    description: 'Branch ID',
    example: 'uuid-branch-id',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiResponse({
    status: 200,
    description: 'Inbound transfers retrieved successfully',
  })
  async findInboundByBranch(
    @Param('branchId', ParseUUIDPipe) branchId: string,
    @Query() query: any,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const searchDto: TransferSearchDto = {
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      toBranchId: branchId,
      status: query.status,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    };

    const result = await this.stockTransfersService.findTransfers(
      searchDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      result,
      'Inbound transfers retrieved successfully',
    );
  }

  @Get('stock-transfers/:id')
  @ApiOperation({
    summary: 'Get stock transfer by ID',
    description: 'Get detailed information about a specific stock transfer.',
  })
  @ApiParam({
    name: 'id',
    description: 'Stock transfer ID',
    example: 'uuid-transfer-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock transfer retrieved successfully',
    type: StockTransferResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Stock transfer not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<StockTransferResponseDto>> {
    const transfer = await this.stockTransfersService.findById(id, req.user.id);

    return ApiResponseHelper.success(
      transfer,
      'Stock transfer retrieved successfully',
    );
  }

  @Patch('stock-transfers/:id')
  @ApiOperation({
    summary: 'Update stock transfer',
    description:
      'Update stock transfer information. Only pending transfers can be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Stock transfer ID',
    example: 'uuid-transfer-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock transfer updated successfully',
    type: StockTransferResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - can only update pending transfers',
  })
  @ApiResponse({
    status: 404,
    description: 'Stock transfer not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransferDto: UpdateStockTransferDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<StockTransferResponseDto>> {
    const transfer = await this.stockTransfersService.update(
      id,
      updateTransferDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      transfer,
      'Stock transfer updated successfully',
    );
  }

  @Post('stock-transfers/:id/send')
  @ApiOperation({
    summary: 'Send stock transfer',
    description:
      'Send a pending transfer (changes status to in_transit and removes stock from source).',
  })
  @ApiParam({
    name: 'id',
    description: 'Stock transfer ID',
    example: 'uuid-transfer-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock transfer sent successfully',
    type: StockTransferResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - can only send pending transfers',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @HttpCode(HttpStatus.OK)
  async sendTransfer(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<StockTransferResponseDto>> {
    const transfer = await this.stockTransfersService.sendTransfer(
      id,
      req.user.id,
    );

    return ApiResponseHelper.success(
      transfer,
      'Stock transfer sent successfully',
    );
  }

  @Post('stock-transfers/:id/complete')
  @ApiOperation({
    summary: 'Complete stock transfer',
    description: 'Complete a transfer (receive at destination and add stock).',
  })
  @ApiParam({
    name: 'id',
    description: 'Stock transfer ID',
    example: 'uuid-transfer-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock transfer completed successfully',
    type: StockTransferResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - can only complete transfers in transit',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @HttpCode(HttpStatus.OK)
  async completeTransfer(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<StockTransferResponseDto>> {
    const transfer = await this.stockTransfersService.completeTransfer(
      id,
      req.user.id,
    );

    return ApiResponseHelper.success(
      transfer,
      'Stock transfer completed successfully',
    );
  }

  @Post('stock-transfers/:id/cancel')
  @ApiOperation({
    summary: 'Cancel stock transfer',
    description: 'Cancel a pending or in-transit transfer.',
  })
  @ApiParam({
    name: 'id',
    description: 'Stock transfer ID',
    example: 'uuid-transfer-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock transfer cancelled successfully',
    type: StockTransferResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - transfer cannot be cancelled',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @HttpCode(HttpStatus.OK)
  async cancelTransfer(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<StockTransferResponseDto>> {
    const transfer = await this.stockTransfersService.cancelTransfer(
      id,
      req.user.id,
    );

    return ApiResponseHelper.success(
      transfer,
      'Stock transfer cancelled successfully',
    );
  }

  @Get('companies/:companyId/stock-transfers/stats')
  @ApiOperation({
    summary: 'Get stock transfer statistics',
    description: 'Get statistics about stock transfers for a company.',
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
    description: 'Stock transfer statistics retrieved successfully',
  })
  async getTransferStats(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('days', new ParseIntPipe({ optional: true })) days: number = 30,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const stats = await this.stockTransfersService.getTransferStats(
      companyId,
      req.user.id,
      days,
    );

    return ApiResponseHelper.success(
      stats,
      'Stock transfer statistics retrieved successfully',
    );
  }
}
