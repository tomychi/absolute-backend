import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ProductType,
  ProductStatus,
  ProductUnit,
} from '../entities/product.entity';
import { Transform } from 'class-transformer';

export class ProductSearchDto {
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
    description: 'Search term for name, SKU, or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: 'physical',
    description: 'Filter by product type',
    enum: ProductType,
  })
  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @ApiPropertyOptional({
    example: 'active',
    description: 'Filter by product status',
    enum: ProductStatus,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({
    example: 'unit',
    description: 'Filter by product unit',
    enum: ProductUnit,
  })
  @IsOptional()
  @IsEnum(ProductUnit)
  unit?: ProductUnit;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by active status',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter by inventory tracking',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  trackInventory?: boolean;

  @ApiPropertyOptional({ example: 100, description: 'Filter by minimum price' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  minPrice?: number;

  @ApiPropertyOptional({
    example: 2000,
    description: 'Filter by maximum price',
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  maxPrice?: number;

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
    example: 'name',
    description: 'Field to sort by',
    enum: [
      'name',
      'sku',
      'price',
      'cost',
      'type',
      'status',
      'createdAt',
      'updatedAt',
    ],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    example: 'DESC',
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
