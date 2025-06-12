import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInvoiceItemDTO {
  @IsString()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unitPrice: number;
}

export class CreateInvoiceDTO {
  @IsString()
  companyId: string;

  @IsString()
  branchId: string;

  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsArray()
  items: CreateInvoiceItemDTO[];

  @IsString()
  @IsOptional()
  note?: string;
}
