import { ApiProperty } from '@nestjs/swagger';
import { ProductType, ProductStatus } from '../entities/product.entity';

export class ProductStatsDto {
  @ApiProperty({ example: 245, description: 'Total number of products' })
  totalProducts: number;

  @ApiProperty({ example: 220, description: 'Active products' })
  activeProducts: number;

  @ApiProperty({ example: 25, description: 'Inactive products' })
  inactiveProducts: number;

  @ApiProperty({
    description: 'Products by type',
    example: {
      physical: 200,
      digital: 30,
      service: 15,
      subscription: 0,
    },
  })
  byType: Record<ProductType, number>;

  @ApiProperty({
    description: 'Products by status',
    example: {
      active: 220,
      inactive: 15,
      discontinued: 8,
      out_of_stock: 2,
    },
  })
  byStatus: Record<ProductStatus, number>;

  @ApiProperty({
    example: 180,
    description: 'Products with inventory tracking',
  })
  trackedProducts: number;

  @ApiProperty({
    example: 65,
    description: 'Products without inventory tracking',
  })
  untrackedProducts: number;

  @ApiProperty({ example: 15, description: 'Products with low stock' })
  lowStockProducts: number;

  @ApiProperty({ example: 8, description: 'Products that need restocking' })
  needsRestockProducts: number;

  @ApiProperty({ example: 145000.5, description: 'Total inventory value' })
  totalInventoryValue: number;

  @ApiProperty({ example: 89.5, description: 'Average product price' })
  averagePrice: number;

  @ApiProperty({ example: 67.2, description: 'Average product cost' })
  averageCost: number;

  @ApiProperty({
    example: 33.2,
    description: 'Average profit margin percentage',
  })
  averageProfitMargin: number;
}
