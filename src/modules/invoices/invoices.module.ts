import { Module } from '@nestjs/common';
import { InvoicesService } from './services/invoices.service';
import { InvoicesController } from './controllers/invoices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Company } from '../companies/entities/company.entity';
import { UserCompany } from '../user-companies/entities/user-company.entity';
import { Product } from '../products/entities/product.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Branch } from '../branches/entities/branch.entity';
import { InvoiceItemsService } from './services/invoice-items.service';
import { InvoiceItemsController } from './controllers/invoice-items.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceItem,
      Company,
      UserCompany,
      Product,
      Customer,
      Branch,
    ]),
  ],
  providers: [InvoicesService, InvoiceItemsService],
  controllers: [InvoicesController, InvoiceItemsController],
  exports: [InvoicesService, InvoiceItemsService, TypeOrmModule],
})
export class InvoicesModule {}
