import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateInvoiceDTO } from '../dto/createInvoice.dto';
import { InvoiceService } from '../services/invoice.service';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() payload: CreateInvoiceDTO) {
    return this.invoiceService.createInvoice(payload);
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.invoiceService.getInvoicesByCompany(companyId);
  }
}
