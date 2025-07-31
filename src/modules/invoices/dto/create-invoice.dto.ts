import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDate,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  IsEnum,
  ArrayMinSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { InvoiceStatus } from '../entities/invoice.entity';

export class CreateInvoiceItemDto {
  @IsUUID(4, { message: 'Product ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Quantity must be a valid number' },
  )
  @Min(0.01, { message: 'Quantity must be greater than 0' })
  @Type(() => Number)
  quantity: number;

  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Unit price must be a valid number' },
  )
  @Min(0, { message: 'Unit price must be positive' })
  @Type(() => Number)
  unitPrice: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Discount amount must be a valid number' },
  )
  @Min(0, { message: 'Discount amount must be positive' })
  @Type(() => Number)
  discountAmount?: number = 0;
}

export class CreateInvoiceDto {
  @IsUUID(4, { message: 'Branch ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Branch ID is required' })
  branchId: string;

  @IsUUID(4, { message: 'Customer ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Customer ID is required' })
  customerId: string;

  @IsOptional()
  @IsEnum(InvoiceStatus, { message: 'Status must be a valid InvoiceStatus' })
  status?: InvoiceStatus = InvoiceStatus.DRAFT;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Tax rate must be a valid number' },
  )
  @Min(0, { message: 'Tax rate must be positive' })
  @Type(() => Number)
  taxRate?: number = 0;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Discount rate must be a valid number' },
  )
  @Min(0, { message: 'Discount rate must be positive' })
  @Type(() => Number)
  discountRate?: number = 0;

  @IsOptional()
  @IsDate({ message: 'Due date must be a valid date' })
  @Type(() => Date)
  dueDate?: Date;

  @IsOptional()
  @IsDate({ message: 'Issued at must be a valid date' })
  @Type(() => Date)
  issuedAt?: Date;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Transform(({ value }) => value?.trim())
  notes?: string;

  @IsArray({ message: 'Items must be an array' })
  @ArrayMinSize(1, { message: 'At least one item is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];

  // These will be set by the service/controller
  userId?: string;
  companyId?: string;
}
