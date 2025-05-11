import { Module } from '@nestjs/common';
import { InvoiceController } from './controllers/invoice.controller';
import { InvoiceService } from './services/invoice.service';

@Module({
  controllers: [InvoiceController],
  providers: [InvoiceService]
})
export class InvoiceModule {}
