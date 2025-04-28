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
import { CompanyService } from '../services/company.service';
import { CompanyCreateDTO, CompanyUpdateDTO } from '../dto/company.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AccessLevelGuard } from 'src/auth/guards/access-level.guard';
import { AccessLevel } from 'src/auth/decorators/access-level.decorator';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { AdminAccess } from 'src/auth/decorators/admin.decorator';

@ApiTags('Company')
@UseGuards(AuthGuard, RolesGuard, AccessLevelGuard)
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @ApiParam({
    name: 'userId',
  })
  @Post('register/:userId')
  public async registerCompany(
    @Body() body: CompanyCreateDTO,
    @Param('userId') userId: string,
  ) {
    return await this.companyService.createCompany(body, userId);
  }

  // @AdminAccess()
  @Get('all')
  public async findAllCompanies() {
    return await this.companyService.findCompanies();
  }

  @ApiParam({
    name: 'companyId',
  })
  @Get(':companyId')
  public async findCompanyById(@Param('companyId') id: string) {
    return await this.companyService.findCompanyById(id);
  }

  @ApiParam({
    name: 'companyId',
  })
  @Get('usersIncludes/:companyId')
  public async findUserIncludesByCompany(@Param('companyId') id: string) {
    return await this.companyService.findUsersIncludesByComapny(id);
  }

  @ApiParam({
    name: 'companyId',
  })
  @AccessLevel('OWNER')
  @Put('edit/:companyId')
  public async updateCompany(
    @Param('companyId', new ParseUUIDPipe()) id: string,
    @Body() body: CompanyUpdateDTO,
  ) {
    return await this.companyService.updateCompany(body, id);
  }

  @ApiParam({
    name: 'companyId',
  })
  @AccessLevel('OWNER')
  @Delete('delete/:companyId')
  public async deleteCompany(
    @Param('companyId', new ParseUUIDPipe()) id: string,
  ) {
    return await this.companyService.deleteCompany(id);
  }
}
