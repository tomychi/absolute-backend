import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { ProductsEntity } from './entities/products.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ProductsEntity])],
  providers: [ProductsService],
  controllers: [ProductsController],
})
export class ProductsModule {}
