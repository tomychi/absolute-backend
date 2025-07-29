import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Company } from '../companies/entities/company.entity';
import { UserCompany } from '../user-companies/entities/user-company.entity';
import { CompaniesModule } from '../companies/companies.module';
import { UserCompaniesModule } from '../user-companies/user-companies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Company, UserCompany]),
    CompaniesModule,
    UserCompaniesModule,
  ],

  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService, TypeOrmModule],
})
export class ProductsModule {}
