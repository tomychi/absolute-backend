import { ApiProperty } from '@nestjs/swagger';

export class InventoryStatsDto {
  @ApiProperty({
    example: 1250,
    description: 'Total unique products in inventory',
  })
  totalProducts: number;

  @ApiProperty({
    example: 15750.5,
    description: 'Total units in stock across all branches',
  })
  totalQuantity: number;

  @ApiProperty({ example: 1245780.95, description: 'Total inventory value' })
  totalValue: number;

  @ApiProperty({ example: 850, description: 'Products in stock' })
  inStockProducts: number;

  @ApiProperty({ example: 125, description: 'Products with low stock' })
  lowStockProducts: number;

  @ApiProperty({ example: 75, description: 'Products out of stock' })
  outOfStockProducts: number;

  @ApiProperty({ example: 200, description: 'Products that need restocking' })
  needsRestockProducts: number;

  @ApiProperty({
    description: 'Inventory by branch',
    example: {
      'Main Store': { products: 500, quantity: 8500.5, value: 678950.25 },
      'Branch A': { products: 350, quantity: 4250.0, value: 345890.5 },
      'Branch B': { products: 400, quantity: 3000.0, value: 220940.2 },
    },
  })
  byBranch: Record<
    string,
    {
      products: number;
      quantity: number;
      value: number;
    }
  >;

  @ApiProperty({
    description: 'Top products by value',
    example: [
      {
        productId: 'uuid-1',
        name: 'Laptop Dell',
        quantity: 50,
        value: 64999.5,
      },
      {
        productId: 'uuid-2',
        name: 'Monitor 24"',
        quantity: 75,
        value: 22499.25,
      },
    ],
  })
  topProductsByValue: Array<{
    productId: string;
    name: string;
    quantity: number;
    value: number;
  }>;

  @ApiProperty({
    description: 'Recent stock movements summary',
    example: {
      todayMovements: 45,
      weekMovements: 187,
      monthMovements: 892,
    },
  })
  recentMovements: {
    todayMovements: number;
    weekMovements: number;
    monthMovements: number;
  };
}
