import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BranchResponseDto } from '../../branches/dto/branch-response.dto';
import { ProductResponseDto } from '../../products/dto/product-response.dto';
import { Inventory } from '../entities/inventory.entity';

export class InventoryResponseDto {
  @ApiProperty({ example: 'uuid-here', description: 'Inventory ID' })
  id: string;

  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID' })
  branchId: string;

  @ApiProperty({ example: 'uuid-product-id', description: 'Product ID' })
  productId: string;

  @ApiProperty({ example: 150.5, description: 'Total quantity in stock' })
  quantity: number;

  @ApiProperty({ example: 25.0, description: 'Reserved quantity' })
  reservedQuantity: number;

  @ApiProperty({ example: 125.5, description: 'Available quantity' })
  availableQuantity: number;

  @ApiPropertyOptional({ example: 89.99, description: 'Average cost per unit' })
  averageCost?: number;

  @ApiProperty({ example: 11289.45, description: 'Total inventory value' })
  totalValue: number;

  @ApiProperty({ example: 11289.45, description: 'Available inventory value' })
  availableValue: number;

  @ApiProperty({ example: false, description: 'Whether stock is low' })
  isLowStock: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether product needs restocking',
  })
  needsRestock: boolean;

  @ApiProperty({
    example: 'in_stock',
    description: 'Stock status',
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'needs_restock'],
  })
  stockStatus: string;

  @ApiProperty({ example: '2024-07-26T15:30:00Z', description: 'Last updated' })
  lastUpdated: Date;

  @ApiPropertyOptional({
    description: 'Branch information',
    type: BranchResponseDto,
  })
  branch?: BranchResponseDto;

  @ApiPropertyOptional({
    description: 'Product information',
    type: ProductResponseDto,
  })
  product?: ProductResponseDto;

  // Static method to transform Inventory entity to DTO
  static fromEntity(inventory: Inventory): InventoryResponseDto {
    return {
      id: inventory.id,
      branchId: inventory.branchId,
      productId: inventory.productId,
      quantity: Number(inventory.quantity),
      reservedQuantity: Number(inventory.reservedQuantity),
      availableQuantity: inventory.availableQuantity,
      averageCost: inventory.averageCost
        ? Number(inventory.averageCost)
        : undefined,
      totalValue: inventory.totalValue,
      availableValue: inventory.availableValue,
      isLowStock: inventory.isLowStock,
      needsRestock: inventory.needsRestock,
      stockStatus: inventory.stockStatus,
      lastUpdated: inventory.lastUpdated,
      branch: inventory.branch
        ? BranchResponseDto.fromEntity(inventory.branch)
        : undefined,
      product: inventory.product
        ? ProductResponseDto.fromEntity(inventory.product)
        : undefined,
    };
  }
}
