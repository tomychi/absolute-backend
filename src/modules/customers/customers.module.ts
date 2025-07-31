import { Module } from '@nestjs/common';
import { CustomersService } from './services/customers.service';
import { CustomersController } from './controllers/customers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Company } from '../companies/entities/company.entity';
import { UserCompaniesModule } from '../user-companies/user-companies.module';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Company, UserCompaniesModule])],

  providers: [CustomersService],
  controllers: [CustomersController],
  exports: [CustomersService, TypeOrmModule],
})
export class CustomersModule {}
