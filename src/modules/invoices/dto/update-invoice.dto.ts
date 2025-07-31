import { PartialType, OmitType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CreateInvoiceDto } from './create-invoice.dto';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';
import { Transform, Type } from 'class-transformer';
import { InvoiceStatus } from '../entities/invoice.entity';

export class UpdateInvoiceItemDto extends PartialType(CreateInvoiceItemDto) {
  @IsOptional()
  @IsUUID(4, { message: 'Item ID must be a valid UUID' })
  id?: string;
}

export class UpdateInvoiceDto extends PartialType(
  OmitType(CreateInvoiceDto, ['branchId', 'customerId', 'items'] as const),
) {
  @IsOptional()
  @IsArray({ message: 'Items must be an array' })
  @ValidateNested({ each: true })
  @Type(() => UpdateInvoiceItemDto)
  items?: UpdateInvoiceItemDto[];
}

export class UpdateInvoiceStatusDto {
  @IsEnum(InvoiceStatus, { message: 'Status must be a valid InvoiceStatus' })
  @IsNotEmpty({ message: 'Status is required' })
  status: InvoiceStatus;

  @IsOptional()
  @IsDate({ message: 'Paid date must be a valid date' })
  @Type(() => Date)
  paidDate?: Date;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @Transform(({ value }) => value?.trim())
  notes?: string;
}
