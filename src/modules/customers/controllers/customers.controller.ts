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
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerFiltersDto } from '../dto/customer-filters.dto';
import {
  CustomerResponseDto,
  PaginatedCustomersResponseDto,
} from '../dto/customer-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post('companies/:companyId/customers')
  @ApiOperation({
    summary: 'Create a new customer',
    description:
      'Create a new customer for a company. User must have owner, admin or manager role.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Company not found' })
  @ApiResponse({ status: 409, description: 'Customer already exists' })
  async create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() createCustomerDto: CreateCustomerDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<CustomerResponseDto>> {
    const customer = await this.customersService.create(
      companyId,
      createCustomerDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      customer,
      'Customer created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get('companies/:companyId/customers')
  @ApiOperation({
    summary: 'Get company customers',
    description: 'Get all customers for a company with search and pagination.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({
    name: 'firstName',
    required: false,
    description: 'Filter by first name',
  })
  @ApiQuery({
    name: 'lastName',
    required: false,
    description: 'Filter by last name',
  })
  @ApiQuery({ name: 'email', required: false, description: 'Filter by email' })
  @ApiQuery({ name: 'taxId', required: false, description: 'Filter by tax ID' })
  @ApiQuery({
    name: 'hasContactInfo',
    required: false,
    description: 'Filter by contact info availability',
  })
  @ApiQuery({
    name: 'isComplete',
    required: false,
    description: 'Filter by completeness',
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
    example: 'createdAt',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order',
    example: 'DESC',
  })
  @ApiResponse({
    status: 200,
    description: 'Customers retrieved successfully',
    type: PaginatedCustomersResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - no access to company' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  async findByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query() filters: CustomerFiltersDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<PaginatedCustomersResponseDto>> {
    const result = await this.customersService.findByCompany(
      companyId,
      filters,
      req.user.id,
    );

    return ApiResponseHelper.success(
      result,
      'Customers retrieved successfully',
    );
  }

  @Get('companies/:companyId/customers/stats')
  @ApiOperation({
    summary: 'Get customer statistics',
    description: 'Get statistics about customers for a company.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer statistics retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - no access to company' })
  async getStats(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const stats = await this.customersService.getCustomerStats(
      companyId,
      req.user.id,
    );

    return ApiResponseHelper.success(
      stats,
      'Customer statistics retrieved successfully',
    );
  }

  @Get('companies/:companyId/customers/search')
  @ApiOperation({
    summary: 'Search customers by text',
    description: 'Quick search customers for dropdowns and selections.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Max results',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Customers found successfully',
    type: [CustomerResponseDto],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - no access to company' })
  async searchCustomers(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('q') searchTerm: string,
    @Query('limit') limit: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<CustomerResponseDto[]>> {
    const limitNumber = limit ? parseInt(limit) : 10;
    const customers = await this.customersService.searchCustomers(
      companyId,
      searchTerm,
      req.user.id,
      limitNumber,
    );

    return ApiResponseHelper.success(customers, 'Customers found successfully');
  }

  @Get('customers/:id')
  @ApiOperation({
    summary: 'Get customer by ID',
    description: 'Get detailed information about a specific customer.',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiQuery({
    name: 'includeStats',
    required: false,
    description: 'Include invoice statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer retrieved successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to customer company',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('includeStats') includeStats: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<CustomerResponseDto>> {
    const includeStatsBoolean = includeStats === 'true';
    const customer = await this.customersService.findById(
      id,
      req.user.id,
      includeStatsBoolean,
    );

    return ApiResponseHelper.success(
      customer,
      'Customer retrieved successfully',
    );
  }

  @Patch('customers/:id')
  @ApiOperation({
    summary: 'Update customer',
    description:
      'Update customer information. User must have owner, admin or manager role.',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 409, description: 'Customer already exists' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<CustomerResponseDto>> {
    const customer = await this.customersService.update(
      id,
      updateCustomerDto,
      req.user.id,
    );

    return ApiResponseHelper.success(customer, 'Customer updated successfully');
  }

  @Delete('customers/:id')
  @ApiOperation({
    summary: 'Delete customer',
    description:
      'Delete a customer. User must have owner, admin or manager role.',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ status: 204, description: 'Customer deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete customer with invoices',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.customersService.remove(id, req.user.id);
  }
}
