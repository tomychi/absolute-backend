import {
  IsArray,
  ValidateNested,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class BulkProductDto extends CreateProductDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Row number in CSV (for error reporting)',
  })
  @IsOptional()
  rowNumber?: number;
}

export class BulkUploadProductDto {
  @ApiProperty({
    description: 'Array of products to create',
    type: [BulkProductDto],
  })
  @IsArray({ message: 'Products must be an array' })
  @ValidateNested({ each: true })
  @Type(() => BulkProductDto)
  products: BulkProductDto[];

  @ApiPropertyOptional({
    example: false,
    description:
      'Whether to skip validation errors and continue with valid products',
  })
  @IsOptional()
  @IsBoolean({ message: 'Skip errors must be a boolean' })
  skipErrors?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether to update existing products with same SKU',
  })
  @IsOptional()
  @IsBoolean({ message: 'Update existing must be a boolean' })
  updateExisting?: boolean;
}

export class BulkUploadResultDto {
  @ApiProperty({ example: 150, description: 'Total products processed' })
  totalProcessed: number;

  @ApiProperty({ example: 145, description: 'Products created successfully' })
  successCount: number;

  @ApiProperty({ example: 3, description: 'Products updated' })
  updatedCount: number;

  @ApiProperty({ example: 2, description: 'Products with errors' })
  errorCount: number;

  @ApiProperty({
    description: 'List of errors encountered',
    example: [
      { row: 5, error: 'SKU already exists', sku: 'EXISTING-001' },
      { row: 12, error: 'Invalid price format', name: 'Product Name' },
    ],
  })
  errors: Array<{
    row?: number;
    error: string;
    sku?: string;
    name?: string;
    field?: string;
  }>;

  @ApiProperty({
    description: 'IDs of successfully created products',
    example: ['uuid-1', 'uuid-2', 'uuid-3'],
  })
  createdIds: string[];

  @ApiProperty({
    description: 'IDs of updated products',
    example: ['uuid-4', 'uuid-5'],
  })
  updatedIds: string[];
}
