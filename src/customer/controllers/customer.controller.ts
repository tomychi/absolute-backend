import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { CustomerCreateDTO, CustomerUpdateDTO } from '../dto/customer.dto';
import { CustomerEntity } from '../entities/customer.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Customer')
@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async createCustomer(
    @Body() dto: CustomerCreateDTO,
  ): Promise<CustomerEntity> {
    return this.customerService.createCustomer(dto);
  }

  @Get(':companyId')
  async getCustomers(
    @Param('companyId') companyId: string,
  ): Promise<CustomerEntity[]> {
    return this.customerService.getCustomersByCompany(companyId);
  }

  @Patch(':id')
  async updateCustomer(
    @Param('id') id: string,
    @Body() dto: CustomerUpdateDTO,
  ): Promise<CustomerEntity> {
    return this.customerService.updateCustomer(id, dto);
  }

  @Delete(':id')
  async deleteCustomer(@Param('id') id: string): Promise<void> {
    return this.customerService.deleteCustomer(id);
  }
}
