import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CompaniesService } from '../services/companies.service';
import { CompanyDTO, CompanyUpdateDTO } from '../dto/company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companyService: CompaniesService) {}

  @Post('create')
  public async createCompany(@Body() body: CompanyDTO) {
    return await this.companyService.createCompany(body);
  }

  @Get('all')
  public async findAllCompanies() {
    return await this.companyService.findCompanies();
  }

  @Get(':id')
  public async findCompanyById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.companyService.findCompanyById(id);
  }

  @Put('edit/:id')
  public async updateCompany(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: CompanyUpdateDTO,
  ) {
    return await this.companyService.updateCompany(body, id);
  }

  @Delete('delete/:id')
  public async deleteCompany(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.companyService.deleteCompany(id);
  }
}
