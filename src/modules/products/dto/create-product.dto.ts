import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
  IsUrl,
  MaxLength,
  MinLength,
  Min,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ProductType,
  ProductStatus,
  ProductUnit,
  ProductDimensions,
  ProductMetadata,
} from '../entities/product.entity';

export class CreateProductDto {
  @ApiProperty({
    example: 'Laptop Dell Inspiron 15',
    description: 'Product name',
    minLength: 2,
    maxLength: 200,
  })
  @IsString({ message: 'Product name must be a string' })
  @MinLength(2, { message: 'Product name must be at least 2 characters long' })
  @MaxLength(200, { message: 'Product name must not exceed 200 characters' })
  name: string;

  @ApiPropertyOptional({
    example: 'DELL-INSP-001',
    description: 'Product SKU (unique per company)',
    pattern: '^[A-Z0-9-_]+$',
  })
  @IsOptional()
  @IsString({ message: 'SKU must be a string' })
  @MaxLength(50, { message: 'SKU must not exceed 50 characters' })
  @Matches(/^[A-Z0-9-_]+$/, {
    message:
      'SKU must contain only uppercase letters, numbers, hyphens, and underscores',
  })
  sku?: string;

  @ApiPropertyOptional({
    example: 'High-performance laptop with 16GB RAM and 512GB SSD',
    description: 'Product description',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @ApiProperty({
    example: 1299.99,
    description: 'Product selling price',
    minimum: 0,
  })
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Price must be a valid number with max 2 decimal places',
    },
  )
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({
    example: 999.5,
    description: 'Product cost price',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Cost must be a valid number with max 2 decimal places',
    },
  )
  @Min(0, { message: 'Cost must be greater than or equal to 0' })
  @Type(() => Number)
  cost?: number;

  @ApiProperty({
    example: 'physical',
    description: 'Product type',
    enum: ProductType,
  })
  @IsEnum(ProductType, { message: 'Type must be a valid product type' })
  type: ProductType;

  @ApiProperty({
    example: 'active',
    description: 'Product status',
    enum: ProductStatus,
  })
  @IsEnum(ProductStatus, { message: 'Status must be a valid product status' })
  status: ProductStatus;

  @ApiProperty({
    example: 'unit',
    description: 'Product unit of measurement',
    enum: ProductUnit,
  })
  @IsEnum(ProductUnit, { message: 'Unit must be a valid product unit' })
  unit: ProductUnit;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the product is active',
  })
  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether to track inventory for this product',
  })
  @IsOptional()
  @IsBoolean({ message: 'Track inventory must be a boolean' })
  trackInventory?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether to allow backorders',
  })
  @IsOptional()
  @IsBoolean({ message: 'Allow backorder must be a boolean' })
  allowBackorder?: boolean;

  @ApiPropertyOptional({
    example: 10,
    description: 'Minimum stock level',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Min stock level must be a number' })
  @Min(0, { message: 'Min stock level must be greater than or equal to 0' })
  @Type(() => Number)
  minStockLevel?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Maximum stock level',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Max stock level must be a number' })
  @Min(0, { message: 'Max stock level must be greater than or equal to 0' })
  @Type(() => Number)
  maxStockLevel?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Reorder point',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Reorder point must be a number' })
  @Min(0, { message: 'Reorder point must be greater than or equal to 0' })
  @Type(() => Number)
  reorderPoint?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Reorder quantity',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Reorder quantity must be a number' })
  @Min(0, { message: 'Reorder quantity must be greater than or equal to 0' })
  @Type(() => Number)
  reorderQuantity?: number;

  @ApiPropertyOptional({
    description: 'Product dimensions',
    example: {
      length: 35.0,
      width: 25.0,
      height: 2.0,
      weight: 2.5,
      unit: 'cm',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Dimensions must be an object' })
  dimensions?: ProductDimensions;

  @ApiPropertyOptional({
    description: 'Product metadata',
    example: {
      brand: 'Dell',
      model: 'Inspiron 15 3000',
      color: 'Black',
      warranty: '1 year',
      tags: ['laptop', 'computer', 'electronics'],
    },
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: ProductMetadata;

  @ApiPropertyOptional({
    example: 'https://example.com/images/product.jpg',
    description: 'Product image URL',
  })
  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  @MaxLength(500, { message: 'Image URL must not exceed 500 characters' })
  imageUrl?: string;

  @ApiPropertyOptional({
    example: '1234567890123',
    description: 'Product barcode',
  })
  @IsOptional()
  @IsString({ message: 'Barcode must be a string' })
  @MaxLength(50, { message: 'Barcode must not exceed 50 characters' })
  barcode?: string;
}
