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
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { InvoicesService } from '../services/invoices.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import {
  UpdateInvoiceDto,
  UpdateInvoiceStatusDto,
} from '../dto/update-invoice.dto';
import { InvoiceFiltersDto } from '../dto/invoice-filters.dto';
import {
  InvoiceResponseDto,
  PaginatedInvoicesResponseDto,
  InvoiceSummaryDto,
} from '../dto/invoice-response.dto';
import { InvoiceStatus } from '../entities/invoice.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('companies/:companyId/invoices')
  @ApiOperation({
    summary: 'Create a new invoice',
    description:
      'Create a new invoice with items for a company. User must have owner, admin or manager role.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully',
    type: InvoiceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Company, branch, customer or product not found',
  })
  async create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() createInvoiceDto: CreateInvoiceDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InvoiceResponseDto>> {
    const result = await this.invoicesService.create(
      companyId,
      createInvoiceDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      result,
      'Invoice created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get('companies/:companyId/invoices')
  @ApiOperation({
    summary: 'Get company invoices',
    description: 'Get all invoices for a company with search and pagination.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter by customer ID',
  })
  @ApiQuery({
    name: 'branchId',
    required: false,
    description: 'Filter by branch ID',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: InvoiceStatus,
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date',
  })
  @ApiQuery({
    name: 'minAmount',
    required: false,
    description: 'Filter by minimum amount',
  })
  @ApiQuery({
    name: 'maxAmount',
    required: false,
    description: 'Filter by maximum amount',
  })
  @ApiQuery({
    name: 'overdue',
    required: false,
    description: 'Filter overdue invoices',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort field',
    example: 'issuedAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    example: 'DESC',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
    type: PaginatedInvoicesResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - no access to company' })
  async findByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query() filters: InvoiceFiltersDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<PaginatedInvoicesResponseDto>> {
    const result = await this.invoicesService.findByCompany(
      companyId,
      filters,
      req.user.id,
    );

    return ApiResponseHelper.success(result, 'Invoices retrieved successfully');
  }

  @Get('companies/:companyId/invoices/summary')
  @ApiOperation({
    summary: 'Get invoice summary statistics',
    description: 'Get summary statistics about invoices for a company.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for period',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for period',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice summary retrieved successfully',
    type: InvoiceSummaryDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - no access to company' })
  async getSummary(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InvoiceSummaryDto>> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const summary = await this.invoicesService.getSummary(
      companyId,
      req.user.id,
      start,
      end,
    );

    return ApiResponseHelper.success(
      summary,
      'Invoice summary retrieved successfully',
    );
  }

  @Get('companies/:companyId/invoices/overdue')
  @ApiOperation({
    summary: 'Get overdue invoices',
    description: 'Get all overdue invoices for a company.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Max results',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Overdue invoices retrieved successfully',
    type: [InvoiceResponseDto],
  })
  async getOverdueInvoices(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('limit') limit: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InvoiceResponseDto[]>> {
    const limitNumber = limit ? parseInt(limit) : 50;
    const filters: InvoiceFiltersDto = {
      overdue: true,
      limit: limitNumber,
      sortBy: 'dueDate',
      sortOrder: 'ASC',
    };

    const result = await this.invoicesService.findByCompany(
      companyId,
      filters,
      req.user.id,
    );

    return ApiResponseHelper.success(
      result.invoices,
      'Overdue invoices retrieved successfully',
    );
  }

  @Get('invoices/:id')
  @ApiOperation({
    summary: 'Get invoice by ID',
    description: 'Get detailed information about a specific invoice.',
  })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice retrieved successfully',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to invoice company',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InvoiceResponseDto>> {
    const invoice = await this.invoicesService.findById(id, req.user.id);

    return ApiResponseHelper.success(invoice, 'Invoice retrieved successfully');
  }

  @Patch('invoices/:id')
  @ApiOperation({
    summary: 'Update invoice',
    description:
      'Update invoice information. Only draft invoices can be modified. User must have owner, admin or manager role.',
  })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice updated successfully',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or invoice cannot be modified',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InvoiceResponseDto>> {
    const invoice = await this.invoicesService.update(
      id,
      updateInvoiceDto,
      req.user.id,
    );

    return ApiResponseHelper.success(invoice, 'Invoice updated successfully');
  }

  @Patch('invoices/:id/status')
  @ApiOperation({
    summary: 'Update invoice status',
    description:
      'Update the status of an invoice (draft → pending → paid/cancelled). User must have owner, admin or manager role.',
  })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice status updated successfully',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid status transition',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateInvoiceStatusDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InvoiceResponseDto>> {
    const invoice = await this.invoicesService.updateStatus(
      id,
      updateStatusDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      invoice,
      'Invoice status updated successfully',
    );
  }

  @Patch('invoices/:id/mark-paid')
  @ApiOperation({
    summary: 'Mark invoice as paid',
    description:
      'Quick action to mark an invoice as paid. User must have owner, admin or manager role.',
  })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice marked as paid successfully',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invoice cannot be paid',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async markAsPaid(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InvoiceResponseDto>> {
    const updateStatusDto: UpdateInvoiceStatusDto = {
      status: InvoiceStatus.PAID,
      paidDate: new Date(),
    };

    const invoice = await this.invoicesService.updateStatus(
      id,
      updateStatusDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      invoice,
      'Invoice marked as paid successfully',
    );
  }

  @Patch('invoices/:id/cancel')
  @ApiOperation({
    summary: 'Cancel invoice',
    description:
      'Cancel an invoice. User must have owner, admin or manager role.',
  })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice cancelled successfully',
    type: InvoiceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invoice cannot be cancelled',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { notes?: string },
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<InvoiceResponseDto>> {
    const updateStatusDto: UpdateInvoiceStatusDto = {
      status: InvoiceStatus.CANCELLED,
      notes: body.notes,
    };

    const invoice = await this.invoicesService.updateStatus(
      id,
      updateStatusDto,
      req.user.id,
    );

    return ApiResponseHelper.success(invoice, 'Invoice cancelled successfully');
  }

  @Delete('invoices/:id')
  @ApiOperation({
    summary: 'Delete invoice',
    description:
      'Delete an invoice. Only draft invoices can be deleted. User must have owner, admin or manager role.',
  })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 204, description: 'Invoice deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - only draft invoices can be deleted',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.invoicesService.remove(id, req.user.id);
  }
}
