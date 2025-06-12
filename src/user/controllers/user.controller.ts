import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/user.service';
import {
  UserCreateDTO,
  UserToCompanyCreateDTO,
  UserUpdateDTO,
} from '../dto/user.dto';
import { PublicAccess } from '../../auth/decorators/public.decorator';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { AccessLevel } from '../../auth/decorators/access-level.decorator';
import { AdminAccess } from '../../auth/decorators/admin.decorator';
import { CompanyEntity } from '../../company/entities/company.entity';

@ApiTags('User')
@Controller('user')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @PublicAccess()
  @Post('register')
  public async registerUser(@Body() body: UserCreateDTO) {
    return await this.userService.createUserCreator(body);
  }

  @AdminAccess()
  @Get('all')
  public async findAllUsers() {
    return await this.userService.findUsers();
  }

  @ApiParam({
    name: 'userId',
  })
  @ApiHeader({
    name: 'absolute_token',
  })
  @ApiResponse({
    status: 400,
    description: 'No se encontro resultado',
  })
  @PublicAccess()
  @Get(':userId')
  public async findUserById(@Param('userId') id: string) {
    return await this.userService.findUserById(id);
  }

  @ApiParam({
    name: 'userId',
  })
  @Put('edit/:userId')
  public async updateUser(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() body: UserUpdateDTO,
  ) {
    return await this.userService.updateUser(body, userId);
  }

  @ApiParam({
    name: 'userId',
  })
  @Delete('delete/:userId')
  public async deleteUser(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return await this.userService.deleteUser(userId);
  }

  // Relation with Company
  @ApiParam({
    name: 'companyId',
  })
  @AccessLevel('OWNER')
  @Post('add-to-company/:companyId')
  public async addTocompany(
    @Body() body: UserToCompanyCreateDTO,
    @Param('companyId', new ParseUUIDPipe()) companyId: string,
  ) {
    return await this.userService.relationToCompany({
      ...body,
      companyId,
    });
  }

  @Get(':userId/companies')
  public async getUserCompanies(
    @Param('userId') userId: string,
  ): Promise<CompanyEntity[]> {
    return this.userService.findUserCompanies(userId);
  }
}
