import {
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsDate,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { InvoiceStatus } from '../entities/invoice.entity';

export class InvoiceFiltersDto {
  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsUUID(4, { message: 'Customer ID must be a valid UUID' })
  customerId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'Branch ID must be a valid UUID' })
  branchId?: string;

  @IsOptional()
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId?: string;

  @IsOptional()
  @IsEnum(InvoiceStatus, { message: 'Status must be a valid InvoiceStatus' })
  status?: InvoiceStatus;

  @IsOptional()
  @IsDate({ message: 'Start date must be a valid date' })
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate({ message: 'End date must be a valid date' })
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Min amount must be a valid number' },
  )
  @Type(() => Number)
  minAmount?: number;

  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Max amount must be a valid number' },
  )
  @Type(() => Number)
  maxAmount?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  overdue?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must not exceed 100' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'Sort by must be a string' })
  sortBy?: string = 'issuedAt';

  @IsOptional()
  @IsString({ message: 'Sort order must be ASC or DESC' })
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
