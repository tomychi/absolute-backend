import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryEntity } from './entities/inventory.entity';
import { ProductEntity } from '../product/entities/product.entity';
import { BranchEntity } from '../branch/entities/branch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryEntity, ProductEntity, BranchEntity]),
  ],
  providers: [InventoryService],
  controllers: [InventoryController],
})
export class InventoryModule {}
