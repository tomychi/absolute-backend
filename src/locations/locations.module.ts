import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsController } from './controllers/locations.controller';
import { LocationsService } from './services/locations.service';
import { LocationsEntity } from './entities/locations.entity';
import { CompaniesEntity } from '../companies/entities/companies.entity';
import { LocationsProductsEntity } from './entities/locationsProducts.entity';
import { ProductsService } from '../products/services/products.service';
import { ProductsEntity } from '../products/entities/products.entity';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LocationsEntity,
      CompaniesEntity,
      LocationsProductsEntity,
      ProductsEntity,
    ]),
    ProductsModule,
  ],
  controllers: [LocationsController],
  providers: [LocationsService, ProductsService],
})
export class LocationsModule {}
