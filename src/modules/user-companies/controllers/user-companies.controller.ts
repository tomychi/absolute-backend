import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { UserCompaniesService } from '../services/user-companies.service';
import { AccessLevelsService } from '../../access-levels/services/access-levels.service';
import { InviteUserDto } from '../dto/invite-user.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { SwitchCompanyDto } from '../dto/switch-company.dto';
import { UserCompanyResponseDto } from '../dto/user-company-response.dto';
import { UserPermissionsResponseDto } from '../dto/user-permissions-response.dto';
import { CompanyMembersResponseDto } from '../dto/company-members-response.dto';
import { Auth } from '../../auth/decorators/auth.decorator';
import { CurrentUserId } from '../../auth/decorators/current-user-id.decorator';
import { AccessLevel } from '../../access-levels/entities/access-level.entity';

interface ApiResponseWrapper<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

@ApiTags('User Companies')
@Controller('user-companies')
@Auth()
export class UserCompaniesController {
  constructor(
    private readonly userCompaniesService: UserCompaniesService,
    private readonly accessLevelsService: AccessLevelsService,
  ) {}

  @Post('invite')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Invite user to company' })
  @ApiBody({ type: InviteUserDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User invited successfully',
    type: UserCompanyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to invite users',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User is already a member of this company',
  })
  async inviteUser(
    @Body(ValidationPipe) inviteDto: InviteUserDto,
    @CurrentUserId() inviterId: string,
  ): Promise<ApiResponseWrapper<UserCompanyResponseDto>> {
    const result: UserCompanyResponseDto =
      await this.userCompaniesService.inviteUser(inviteDto, inviterId);
    return {
      success: true,
      message: 'User invited successfully',
      data: result,
    };
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept company invitation' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'User-company relationship ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invitation accepted successfully',
    type: UserCompanyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invitation not found or already processed',
  })
  async acceptInvitation(
    @Param('id', ParseUUIDPipe) userCompanyId: string,
    @CurrentUserId() userId: string,
  ): Promise<ApiResponseWrapper<UserCompanyResponseDto>> {
    const result: UserCompanyResponseDto =
      await this.userCompaniesService.acceptInvitation(userCompanyId, userId);
    return {
      success: true,
      message: 'Invitation accepted successfully',
      data: result,
    };
  }

  @Get('my-companies')
  @ApiOperation({ summary: 'Get current user companies' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User companies retrieved successfully',
    type: [UserCompanyResponseDto],
  })
  async getMyCompanies(
    @CurrentUserId() userId: string,
  ): Promise<ApiResponseWrapper<UserCompanyResponseDto[]>> {
    const companies: UserCompanyResponseDto[] =
      await this.userCompaniesService.getUserCompanies(userId);
    return {
      success: true,
      message: 'User companies retrieved successfully',
      data: companies,
    };
  }

  @Get('company/:companyId/members')
  @ApiOperation({ summary: 'Get company members' })
  @ApiParam({
    name: 'companyId',
    type: 'string',
    format: 'uuid',
    description: 'Company ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company members retrieved successfully',
    type: CompanyMembersResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this company',
  })
  async getCompanyMembers(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUserId() userId: string,
  ): Promise<ApiResponseWrapper<CompanyMembersResponseDto>> {
    const result: CompanyMembersResponseDto =
      await this.userCompaniesService.getCompanyMembers(companyId, userId);
    return {
      success: true,
      message: 'Company members retrieved successfully',
      data: result,
    };
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role in company' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'User-company relationship ID',
  })
  @ApiBody({ type: UpdateUserRoleDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User role updated successfully',
    type: UserCompanyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to change roles',
  })
  async updateUserRole(
    @Param('id', ParseUUIDPipe) userCompanyId: string,
    @Body(ValidationPipe) updateDto: UpdateUserRoleDto,
    @CurrentUserId() requesterId: string,
  ): Promise<ApiResponseWrapper<UserCompanyResponseDto>> {
    const result: UserCompanyResponseDto =
      await this.userCompaniesService.updateUserRole(
        userCompanyId,
        updateDto,
        requesterId,
      );
    return {
      success: true,
      message: 'User role updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove user from company' })
  @ApiParam({
    name: 'id',
    type: 'string',
    format: 'uuid',
    description: 'User-company relationship ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User removed from company successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions to remove users',
  })
  async removeUserFromCompany(
    @Param('id', ParseUUIDPipe) userCompanyId: string,
    @CurrentUserId() requesterId: string,
  ): Promise<ApiResponseWrapper<null>> {
    await this.userCompaniesService.removeUserFromCompany(
      userCompanyId,
      requesterId,
    );
    return {
      success: true,
      message: 'User removed from company successfully',
    };
  }

  @Post('switch-company')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Switch active company' })
  @ApiBody({ type: SwitchCompanyDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Company switched successfully',
    type: UserCompanyResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this company',
  })
  async switchCompany(
    @Body(ValidationPipe) switchDto: SwitchCompanyDto,
    @CurrentUserId() userId: string,
  ): Promise<ApiResponseWrapper<UserCompanyResponseDto>> {
    const result: UserCompanyResponseDto =
      await this.userCompaniesService.switchCompany(
        userId,
        switchDto.companyId,
      );
    return {
      success: true,
      message: 'Company switched successfully',
      data: result,
    };
  }

  @Get('company/:companyId/my-permissions')
  @ApiOperation({ summary: 'Get current user permissions for company' })
  @ApiParam({
    name: 'companyId',
    type: 'string',
    format: 'uuid',
    description: 'Company ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User permissions retrieved successfully',
    type: UserPermissionsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User is not a member of this company',
  })
  async getMyPermissions(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUserId() userId: string,
  ): Promise<ApiResponseWrapper<UserPermissionsResponseDto>> {
    const result: UserPermissionsResponseDto =
      await this.userCompaniesService.getUserPermissions(userId, companyId);
    return {
      success: true,
      message: 'User permissions retrieved successfully',
      data: result,
    };
  }

  @Get('access-levels')
  @ApiOperation({ summary: 'Get available access levels' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access levels retrieved successfully',
    type: [AccessLevel],
  })
  async getAccessLevels(): Promise<ApiResponseWrapper<AccessLevel[]>> {
    const accessLevels: AccessLevel[] =
      await this.accessLevelsService.findAll();
    return {
      success: true,
      message: 'Access levels retrieved successfully',
      data: accessLevels,
    };
  }

  @Get('access-levels/:id/permissions')
  @ApiOperation({ summary: 'Get permissions for access level' })
  @ApiParam({ name: 'id', type: 'number', description: 'Access level ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access level permissions retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Access level not found',
  })
  async getAccessLevelPermissions(
    @Param('id', ParseIntPipe) accessLevelId: number,
  ): Promise<ApiResponseWrapper<Record<string, any>>> {
    const permissions =
      await this.accessLevelsService.getPermissions(accessLevelId);
    return {
      success: true,
      message: 'Access level permissions retrieved successfully',
      data: permissions,
    };
  }
}
