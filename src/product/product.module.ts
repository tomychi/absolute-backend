import { Module } from '@nestjs/common';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { ProductEntity } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from '../company/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, CompanyEntity])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
