import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class InventorySearchDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;

  @ApiPropertyOptional({
    example: 'laptop',
    description: 'Search term for product name or SKU',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'uuid-branch-id',
    description: 'Filter by branch ID',
  })
  @IsOptional()
  @IsUUID(4)
  branchId?: string;

  @ApiPropertyOptional({
    example: 'uuid-product-id',
    description: 'Filter by product ID',
  })
  @IsOptional()
  @IsUUID(4)
  productId?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter products with low stock',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  lowStock?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter products that need restock',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  needsRestock?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter products out of stock',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  outOfStock?: boolean;

  @ApiPropertyOptional({
    example: 'in_stock',
    description: 'Filter by stock status',
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'needs_restock'],
  })
  @IsOptional()
  @IsEnum(['in_stock', 'low_stock', 'out_of_stock', 'needs_restock'])
  stockStatus?: string;

  @ApiPropertyOptional({
    example: 'quantity',
    description: 'Field to sort by',
    enum: [
      'quantity',
      'availableQuantity',
      'totalValue',
      'lastUpdated',
      'productName',
    ],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'lastUpdated';

  @ApiPropertyOptional({
    example: 'DESC',
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
