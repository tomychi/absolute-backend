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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { BranchesService } from '../services/branches.service';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { BranchSearchDto } from '../dto/branch-search.dto';
import { BranchResponseDto } from '../dto/branch-response.dto';
import { BranchSummaryDto } from '../dto/branch-summary.dto';
import { AssignManagerDto } from '../dto/assign-manager.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiResponseHelper } from '../../../common/helpers/api-response.helper';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@ApiTags('Branches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post('companies/:companyId/branches')
  @ApiOperation({
    summary: 'Create new branch',
    description:
      'Create a new branch for a company. User must have owner or admin role.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiResponse({
    status: 201,
    description: 'Branch created successfully',
    type: BranchResponseDto,
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
    description: 'Branch code already exists in company',
  })
  async create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() createBranchDto: CreateBranchDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<BranchResponseDto>> {
    const branch = await this.branchesService.create(
      companyId,
      createBranchDto,
      req.user.id,
    );

    return ApiResponseHelper.success(
      branch,
      'Branch created successfully',
      HttpStatus.CREATED,
    );
  }

  @Get('companies/:companyId/branches')
  @ApiOperation({
    summary: 'Get company branches',
    description: 'Get all branches for a company with search and pagination.',
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
    description: 'Branch type filter',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'Active status filter',
  })
  @ApiQuery({
    name: 'isMain',
    required: false,
    description: 'Main branch filter',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (ASC/DESC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Branches retrieved successfully',
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
    @Query() searchDto: BranchSearchDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const result = await this.branchesService.findByCompany(
      companyId,
      searchDto,
      req.user.id,
    );

    return ApiResponseHelper.success(result, 'Branches retrieved successfully');
  }

  @Get('companies/:companyId/branches/summaries')
  @ApiOperation({
    summary: 'Get branch summaries',
    description:
      'Get simplified branch information for dropdowns and selections.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description: 'Include only active branches',
    type: Boolean,
  })
  @ApiResponse({
    status: 200,
    description: 'Branch summaries retrieved successfully',
    type: [BranchSummaryDto],
  })
  async getBranchSummaries(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('activeOnly') activeOnly: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<BranchSummaryDto[]>> {
    const isActiveOnly = activeOnly === 'true';

    const summaries = await this.branchesService.getBranchSummaries(
      companyId,
      req.user.id,
      isActiveOnly,
    );

    return ApiResponseHelper.success(
      summaries,
      'Branch summaries retrieved successfully',
    );
  }

  @Get('companies/:companyId/branches/main')
  @ApiOperation({
    summary: 'Get main branch',
    description: 'Get the main branch for a company.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Main branch retrieved successfully',
    type: BranchResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Main branch not found',
  })
  async getMainBranch(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<BranchResponseDto>> {
    const mainBranch = await this.branchesService.getMainBranch(
      companyId,
      req.user.id,
    );

    return ApiResponseHelper.success(
      mainBranch,
      'Main branch retrieved successfully',
    );
  }

  @Get('companies/:companyId/branches/stats')
  @ApiOperation({
    summary: 'Get branch statistics',
    description: 'Get statistics about branches for a company.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Branch statistics retrieved successfully',
  })
  async getBranchStats(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const stats = await this.branchesService.getCompanyBranchStats(
      companyId,
      req.user.id,
    );

    return ApiResponseHelper.success(
      stats,
      'Branch statistics retrieved successfully',
    );
  }

  @Get('branches/:id')
  @ApiOperation({
    summary: 'Get branch by ID',
    description: 'Get detailed information about a specific branch.',
  })
  @ApiParam({
    name: 'id',
    description: 'Branch ID',
    example: 'uuid-branch-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Branch retrieved successfully',
    type: BranchResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to branch company',
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<BranchResponseDto>> {
    const branch = await this.branchesService.findById(id, req.user.id);

    return ApiResponseHelper.success(branch, 'Branch retrieved successfully');
  }

  @Patch('branches/:id')
  @ApiOperation({
    summary: 'Update branch',
    description:
      'Update branch information. User must have owner or admin role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Branch ID',
    example: 'uuid-branch-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Branch updated successfully',
    type: BranchResponseDto,
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
    description: 'Branch not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBranchDto: UpdateBranchDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<BranchResponseDto>> {
    const branch = await this.branchesService.update(
      id,
      updateBranchDto,
      req.user.id,
    );

    return ApiResponseHelper.success(branch, 'Branch updated successfully');
  }

  @Patch('branches/:id/toggle-status')
  @ApiOperation({
    summary: 'Toggle branch status',
    description:
      'Activate or deactivate a branch. User must have owner or admin role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Branch ID',
    example: 'uuid-branch-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Branch status toggled successfully',
    type: BranchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - cannot deactivate main branch',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found',
  })
  async toggleStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<BranchResponseDto>> {
    const branch = await this.branchesService.toggleStatus(id, req.user.id);

    return ApiResponseHelper.success(
      branch,
      'Branch status toggled successfully',
    );
  }

  @Patch('branches/:id/assign-manager')
  @ApiOperation({
    summary: 'Assign manager to branch',
    description:
      'Assign or remove a manager from a branch. User must have owner or admin role.',
  })
  @ApiParam({
    name: 'id',
    description: 'Branch ID',
    example: 'uuid-branch-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Manager assigned successfully',
    type: BranchResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - manager validation error',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - insufficient permissions',
  })
  @ApiResponse({
    status: 404,
    description: 'Branch or manager not found',
  })
  async assignManager(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignManagerDto: AssignManagerDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<BranchResponseDto>> {
    const branch = await this.branchesService.assignManager(
      id,
      assignManagerDto,
      req.user.id,
    );

    const message = assignManagerDto.managerId
      ? 'Manager assigned successfully'
      : 'Manager removed successfully';

    return ApiResponseHelper.success(branch, message);
  }

  @Post('branches/:fromId/transfer-main/:toId')
  @ApiOperation({
    summary: 'Transfer main branch status',
    description:
      'Transfer main branch status from one branch to another. User must have owner role.',
  })
  @ApiParam({
    name: 'fromId',
    description: 'Current main branch ID',
    example: 'uuid-from-branch-id',
  })
  @ApiParam({
    name: 'toId',
    description: 'New main branch ID',
    example: 'uuid-to-branch-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Main branch status transferred successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only owners can transfer main status',
  })
  @ApiResponse({
    status: 404,
    description: 'One or both branches not found',
  })
  @HttpCode(HttpStatus.OK)
  async transferMainStatus(
    @Param('fromId', ParseUUIDPipe) fromId: string,
    @Param('toId', ParseUUIDPipe) toId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<any>> {
    const result = await this.branchesService.transferMainStatus(
      fromId,
      toId,
      req.user.id,
    );

    return ApiResponseHelper.success(
      result,
      'Main branch status transferred successfully',
    );
  }

  @Get('companies/:companyId/branches/generate-code')
  @ApiOperation({
    summary: 'Generate branch code suggestion',
    description:
      'Generate a unique branch code suggestion based on company and branch name.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'Company ID',
    example: 'uuid-company-id',
  })
  @ApiQuery({
    name: 'branchName',
    description: 'Branch name to generate code for',
    example: 'Tienda Centro',
  })
  @ApiResponse({
    status: 200,
    description: 'Branch code suggestion generated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - no access to company',
  })
  @ApiResponse({
    status: 404,
    description: 'Company not found',
  })
  async generateCodeSuggestion(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query('branchName') branchName: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponseHelper<{ suggestedCode: string }>> {
    const suggestedCode = await this.branchesService.generateCodeSuggestion(
      companyId,
      branchName,
      req.user.id,
    );

    return ApiResponseHelper.success(
      { suggestedCode },
      'Branch code suggestion generated successfully',
    );
  }

  @Delete('branches/:id')
  @ApiOperation({
    summary: 'Delete branch',
    description:
      'Soft delete a branch. User must have owner role. Cannot delete main branch if other branches exist.',
  })
  @ApiParam({
    name: 'id',
    description: 'Branch ID',
    example: 'uuid-branch-id',
  })
  @ApiResponse({
    status: 204,
    description: 'Branch deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - cannot delete main branch',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only owners can delete branches',
  })
  @ApiResponse({
    status: 404,
    description: 'Branch not found',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.branchesService.remove(id, req.user.id);
  }
}
