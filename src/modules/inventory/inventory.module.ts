import { Module } from '@nestjs/common';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';
import { StockMovementsService } from './services/stock-movements.service';
import { StockTransfersService } from './services/stock-transfers.service';
import { StockMovementsController } from './controllers/stock-movements.controller';
import { StockTransfersController } from './controllers/stock-transfers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './entities/inventory.entity';
import { StockMovement } from './entities/stock-movement.entity';
import { StockTransfer } from './entities/stock-transfer.entity';
import { StockTransferItem } from './entities/stock-transfer-item.entity';
import { Product } from '../products/entities/product.entity';
import { Branch } from '../branches/entities/branch.entity';
import { UserCompany } from '../user-companies/entities/user-company.entity';
import { ProductsModule } from '../products/products.module';
import { BranchesModule } from '../branches/branches.module';
import { UserCompaniesModule } from '../user-companies/user-companies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Inventory,
      StockMovement,
      StockTransfer,
      StockTransferItem,
      Product,
      Branch,
      UserCompany,
    ]),
    ProductsModule,
    BranchesModule,
    UserCompaniesModule,
  ],

  providers: [InventoryService, StockMovementsService, StockTransfersService],
  controllers: [
    InventoryController,
    StockMovementsController,
    StockTransfersController,
  ],
  exports: [
    InventoryService,
    StockMovementsService,
    StockTransfersService,
    TypeOrmModule,
  ],
})
export class InventoryModule {}
