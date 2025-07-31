import { IsUUID, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

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
