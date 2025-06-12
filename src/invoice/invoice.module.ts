import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceController } from './controllers/invoice.controller';
import { InvoiceService } from './services/invoice.service';
import { InvoiceEntity } from './entities/invoice.entity';
import { InvoiceItemEntity } from './entities/invoice-item.entity';
import { UserEntity } from '../user/entities/user.entity';
import { BranchEntity } from '../branch/entities/branch.entity';
import { CustomerEntity } from '../customer/entities/customer.entity';
import { ProductEntity } from '../product/entities/product.entity';
import { InventoryEntity } from '../inventory/entities/inventory.entity';
import { StockMovementEntity } from '../stock/entities/stockMovement.entity';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvoiceEntity,
      InvoiceItemEntity,
      UserEntity,
      BranchEntity,
      CustomerEntity,
      ProductEntity,
      InventoryEntity,
      StockMovementEntity,
    ]),
    StockModule,
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
