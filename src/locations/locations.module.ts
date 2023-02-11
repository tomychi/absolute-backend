import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationsController } from './controllers/locations.controller';
import { LocationsService } from './services/locations.service';
import { LocationsEntity } from './entities/locations.entity';
import { CompaniesEntity } from '../companies/entities/companies.entity';
import { LocationsProductsEntity } from './entities/locationsProducts.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LocationsEntity,
      CompaniesEntity,
      LocationsProductsEntity,
    ]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
