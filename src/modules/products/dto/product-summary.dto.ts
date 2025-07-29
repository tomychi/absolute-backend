import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ProductType,
  ProductStatus,
  ProductUnit,
  Product,
} from '../entities/product.entity';

export class ProductSummaryDto {
  @ApiProperty({ example: 'uuid-here', description: 'Product ID' })
  id: string;

  @ApiProperty({
    example: 'Laptop Dell Inspiron 15',
    description: 'Product name',
  })
  name: string;

  @ApiPropertyOptional({ example: 'DELL-INSP-001', description: 'Product SKU' })
  sku?: string;

  @ApiProperty({ example: 1299.99, description: 'Product price' })
  price: number;

  @ApiPropertyOptional({ example: 999.5, description: 'Product cost' })
  cost?: number;

  @ApiProperty({
    example: 'physical',
    description: 'Product type',
    enum: ProductType,
  })
  type: ProductType;

  @ApiProperty({
    example: 'active',
    description: 'Product status',
    enum: ProductStatus,
  })
  status: ProductStatus;

  @ApiProperty({
    example: 'unit',
    description: 'Product unit',
    enum: ProductUnit,
  })
  unit: ProductUnit;

  @ApiProperty({ example: true, description: 'Whether product is active' })
  isActive: boolean;

  @ApiProperty({ example: true, description: 'Whether inventory is tracked' })
  trackInventory: boolean;

  @ApiProperty({
    example: 'Laptop Dell Inspiron 15 (DELL-INSP-001)',
    description: 'Display name',
  })
  displayName: string;

  @ApiPropertyOptional({
    example: 'https://example.com/image.jpg',
    description: 'Image URL',
  })
  imageUrl?: string;

  // Static method to create summary from product entity
  static fromEntity(product: Product): ProductSummaryDto {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: Number(product.price),
      cost: product.cost ? Number(product.cost) : undefined,
      type: product.type,
      status: product.status,
      unit: product.unit,
      isActive: product.isActive,
      trackInventory: product.trackInventory,
      displayName: product.displayName,
      imageUrl: product.imageUrl,
    };
  }
}
