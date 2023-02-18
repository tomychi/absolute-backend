import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
} from '@nestjs/common';
import { CompaniesService } from '../services/companies.service';
import { CompanyUpdateDTO } from '../dto/company.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companyService: CompaniesService) {}

  @Get('all')
  public async findAllCompanies() {
    return await this.companyService.findCompanies();
  }

  @Get(':id')
  public async findCompanyById(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.companyService.findCompanyById(id);
  }

  // companies with locations
  @Get('locations/:id')
  public async findCompanyWithLocations(
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return await this.companyService.findCompanyWithLocations(id);
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
