import { Module } from '@nestjs/common';
import { StockController } from './controllers/stock.controller';
import { StockService } from './services/stock.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockMovementEntity } from './entities/stockMovement.entity';
import { StockMovementTypeEntity } from './entities/stockMovementType.entity';
import { BranchEntity } from '../branch/entities/branch.entity';
import { UserEntity } from '../user/entities/user.entity';
import { InventoryEntity } from '../inventory/entities/inventory.entity';
import { ProductEntity } from '../product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StockMovementTypeEntity,
      StockMovementEntity,
      InventoryEntity,
      ProductEntity,
      BranchEntity,
      UserEntity,
    ]),
  ],
  controllers: [StockController],
  providers: [StockService],
  exports: [TypeOrmModule, StockService],
})
export class StockModule {}
