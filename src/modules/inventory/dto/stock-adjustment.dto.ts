import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsUUID,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class StockAdjustmentDto {
  @ApiProperty({ example: 'uuid-product-id', description: 'Product ID' })
  @IsUUID(4, { message: 'Product ID must be a valid UUID' })
  productId: string;

  @ApiProperty({ example: 125.5, description: 'New quantity to set' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'New quantity must be a valid number' },
  )
  newQuantity: number;

  @ApiPropertyOptional({
    example: 'Physical count adjustment',
    description: 'Reason for adjustment',
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  @MaxLength(1000, { message: 'Reason must not exceed 1000 characters' })
  reason?: string;

  @ApiPropertyOptional({
    example: 89.99,
    description: 'Cost per unit for new stock',
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Cost per unit must be a valid number' },
  )
  costPerUnit?: number;
}

export class BulkStockAdjustmentDto {
  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID' })
  @IsUUID(4, { message: 'Branch ID must be a valid UUID' })
  branchId: string;

  @ApiProperty({
    description: 'Array of stock adjustments',
    type: [StockAdjustmentDto],
  })
  adjustments: StockAdjustmentDto[];

  @ApiPropertyOptional({
    example: 'Monthly inventory count',
    description: 'General notes for all adjustments',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;
}
