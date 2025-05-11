import { Module } from '@nestjs/common';
import { CustomerService } from './services/customer.service';
import { CustomerController } from './controllers/customer.controller';

@Module({
  providers: [CustomerService],
  controllers: [CustomerController]
})
export class CustomerModule {}
