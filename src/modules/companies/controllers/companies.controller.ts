import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CompaniesService } from '../services/companies.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CompanyResponseDto } from '../dto/company-response.dto';
import { CompanyPublicDto } from '../dto/company-public.dto';
import { CompanySearchDto } from '../dto/company-search.dto';
import { Auth } from '../../auth/decorators/auth.decorator';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { Public } from '../../auth/decorators/public.decorator';

interface ApiResponseWrapper<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company created successfully',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Tax ID already exists',
  })
  async create(
    @Body(ValidationPipe) createCompanyDto: CreateCompanyDto,
    @CurrentUserId() userId: string,
  ): Promise<ApiResponseWrapper<CompanyResponseDto>> {
    const company: CompanyResponseDto = await this.companiesService.create(
      createCompanyDto,
      userId,
    );
    return {
      success: true,
      message: 'Company created successfully',
      data: company,
    };
  }

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get all companies accessible by current user' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for name or description',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['name', 'createdAt', 'updatedAt'],
    description: 'Sort by field',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Companies retrieved successfully',
    type: [CompanyResponseDto],
  })
  async findAll(
    @Query(ValidationPipe) searchDto: CompanySearchDto,
    @CurrentUserId() userId: string,
  ): Promise<ApiResponseWrapper<CompanyResponseDto[]>> {
    const result = await this.companiesService.findByUser(userId, searchDto);
    return {
      success: true,
      message: 'Companies retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('public/search')
  @Public()
  @ApiOperation({ summary: 'Public search for companies by name' })
  @ApiQuery({ name: 'q', type: String, description: 'Search term' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum results (default: 10)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Public companies search results',
    type: [CompanyPublicDto],
  })
  async searchPublic(
    @Query('q') searchTerm: string,
    @Query('limit') limit?: number,
  ): Promise<ApiResponseWrapper<CompanyPublicDto[]>> {
    const companies: CompanyPublicDto[] =
      await this.companiesService.searchPublic(searchTerm, limit);
    return {
      success: true,
      message: 'Public search completed successfully',
      data: companies,
    };
  }

  @Get('stats')
  @Auth()
  @ApiOperation({ summary: 'Get companies statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
  })
  async getStats(): Promise<ApiResponseWrapper<any>> {
    const stats = await this.companiesService.getStats();
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }

  @Get('recent')
  @Auth()
  @ApiOperation({ summary: 'Get recently created companies' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of companies (default: 5)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recent companies retrieved successfully',
    type: [CompanyResponseDto],
  })
  async getRecent(
    @Query('limit') limit?: number,
  ): Promise<ApiResponseWrapper<CompanyResponseDto[]>> {
    const companies: CompanyResponseDto[] =
      await this.companiesService.getRecentlyCreated(limit);
    return {
      success: true,
      message: 'Recent companies retrieved successfully',
      data: companies,
    };
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Company ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company retrieved successfully',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId: string,
  ): Promise<ApiResponseWrapper<CompanyResponseDto>> {
    const company: CompanyResponseDto =
      await this.companiesService.findOneWithAccess(id, userId);
    return {
      success: true,
      message: 'Company retrieved successfully',
      data: company,
    };
  }

  @Get(':id/public')
  @Public()
  @ApiOperation({ summary: 'Get public company information' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Company ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Public company information retrieved successfully',
    type: CompanyPublicDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found or inactive',
  })
  async getPublicInfo(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponseWrapper<CompanyPublicDto>> {
    const company: CompanyPublicDto =
      await this.companiesService.getPublicInfo(id);
    return {
      success: true,
      message: 'Public company information retrieved successfully',
      data: company,
    };
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update company by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Company ID',
  })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company updated successfully',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateCompanyDto: UpdateCompanyDto,
    @CurrentUserId() userId: string,
  ): Promise<ApiResponseWrapper<CompanyResponseDto>> {
    const company: CompanyResponseDto = await this.companiesService.update(
      id,
      updateCompanyDto,
      userId,
    );
    return {
      success: true,
      message: 'Company updated successfully',
      data: company,
    };
  }

  @Patch(':id/toggle-status')
  @Auth()
  @ApiOperation({ summary: 'Toggle company active status' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Company ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company status updated successfully',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId: string,
  ): Promise<ApiResponseWrapper<CompanyResponseDto>> {
    const company: CompanyResponseDto =
      await this.companiesService.toggleStatus(id, userId);
    return {
      success: true,
      message: 'Company status updated successfully',
      data: company,
    };
  }

  @Delete(':id')
  @Auth()
  @ApiOperation({ summary: 'Soft delete company by ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'Company ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUserId() userId: string,
  ): Promise<ApiResponseWrapper<null>> {
    await this.companiesService.remove(id, userId);
    return {
      success: true,
      message: 'Company deleted successfully',
    };
  }

  @Get('tax-id/:taxId')
  @Auth()
  @ApiOperation({ summary: 'Find company by tax ID' })
  @ApiParam({ name: 'taxId', type: 'string', description: 'Tax ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company found by tax ID',
    type: CompanyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Company not found',
  })
  async findByTaxId(
    @Param('taxId') taxId: string,
  ): Promise<ApiResponseWrapper<CompanyResponseDto | null>> {
    const company: CompanyResponseDto | null =
      await this.companiesService.findByTaxId(taxId);
    return {
      success: true,
      message: company ? 'Company found' : 'Company not found',
      data: company,
    };
  }
}
