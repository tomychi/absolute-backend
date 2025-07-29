import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ProductType,
  ProductStatus,
  ProductUnit,
  ProductDimensions,
  ProductMetadata,
  Product,
} from '../entities/product.entity';
import { CompanyResponseDto } from '../../companies/dto/company-response.dto';

export class ProductResponseDto {
  @ApiProperty({ example: 'uuid-here', description: 'Product ID' })
  id: string;

  @ApiProperty({
    example: 'Laptop Dell Inspiron 15',
    description: 'Product name',
  })
  name: string;

  @ApiPropertyOptional({ example: 'DELL-INSP-001', description: 'Product SKU' })
  sku?: string;

  @ApiPropertyOptional({
    example: 'High-performance laptop...',
    description: 'Product description',
  })
  description?: string;

  @ApiProperty({ example: 1299.99, description: 'Product selling price' })
  price: number;

  @ApiPropertyOptional({ example: 999.5, description: 'Product cost price' })
  cost?: number;

  @ApiProperty({
    example: 'physical',
    description: 'Product type',
    enum: ProductType,
  })
  type: ProductType;

  @ApiProperty({
    example: 'Physical Product',
    description: 'Product type display name',
  })
  typeDisplayName: string;

  @ApiProperty({
    example: 'active',
    description: 'Product status',
    enum: ProductStatus,
  })
  status: ProductStatus;

  @ApiProperty({
    example: 'Active',
    description: 'Product status display name',
  })
  statusDisplayName: string;

  @ApiProperty({
    example: 'unit',
    description: 'Product unit',
    enum: ProductUnit,
  })
  unit: ProductUnit;

  @ApiProperty({ example: 'Unit', description: 'Product unit display name' })
  unitDisplayName: string;

  @ApiProperty({ example: true, description: 'Whether product is active' })
  isActive: boolean;

  @ApiProperty({ example: true, description: 'Whether inventory is tracked' })
  trackInventory: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether backorders are allowed',
  })
  allowBackorder: boolean;

  @ApiProperty({ example: 10, description: 'Minimum stock level' })
  minStockLevel: number;

  @ApiPropertyOptional({ example: 100, description: 'Maximum stock level' })
  maxStockLevel?: number;

  @ApiProperty({ example: 20, description: 'Reorder point' })
  reorderPoint: number;

  @ApiProperty({ example: 50, description: 'Reorder quantity' })
  reorderQuantity: number;

  @ApiPropertyOptional({ description: 'Product dimensions' })
  dimensions?: ProductDimensions;

  @ApiPropertyOptional({ description: 'Product metadata' })
  metadata?: ProductMetadata;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'Image URL',
  })
  imageUrl?: string;

  @ApiPropertyOptional({ example: '1234567890123', description: 'Barcode' })
  barcode?: string;

  @ApiProperty({
    example: '2024-07-25T01:00:00Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-07-25T01:00:00Z',
    description: 'Last update date',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 'Laptop Dell Inspiron 15 (DELL-INSP-001)',
    description: 'Display name',
  })
  displayName: string;

  @ApiProperty({ example: 30.05, description: 'Profit margin percentage' })
  profitMargin: number;

  @ApiProperty({ example: 300.49, description: 'Profit amount' })
  profitAmount: number;

  @ApiPropertyOptional({
    description: 'Company information',
    type: CompanyResponseDto,
  })
  company?: CompanyResponseDto;

  // Static method to transform Product entity to DTO
  static fromEntity(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: Number(product.price),
      cost: product.cost ? Number(product.cost) : undefined,
      type: product.type,
      typeDisplayName: product.typeDisplayName,
      status: product.status,
      statusDisplayName: product.statusDisplayName,
      unit: product.unit,
      unitDisplayName: product.unitDisplayName,
      isActive: product.isActive,
      trackInventory: product.trackInventory,
      allowBackorder: product.allowBackorder,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      reorderPoint: product.reorderPoint,
      reorderQuantity: product.reorderQuantity,
      dimensions: product.dimensions,
      metadata: product.metadata,
      imageUrl: product.imageUrl,
      barcode: product.barcode,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      displayName: product.displayName,
      profitMargin: product.profitMargin,
      profitAmount: product.profitAmount,
      company: product.company
        ? CompanyResponseDto.fromEntity(product.company)
        : undefined,
    };
  }
}
