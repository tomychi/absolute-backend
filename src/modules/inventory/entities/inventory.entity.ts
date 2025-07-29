import {
  Entity,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNumber, IsUUID, Min } from 'class-validator';
import { Branch } from '../../branches/entities/branch.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('inventory')
@Unique(['branchId', 'productId']) // Each product can only have one inventory record per branch
@Index(['branchId'])
@Index(['productId'])
@Index(['branchId', 'quantity'])
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'branch_id' })
  @IsUUID(4, { message: 'Branch ID must be a valid UUID' })
  branchId: string;

  @Column({ name: 'product_id' })
  @IsUUID(4, { message: 'Product ID must be a valid UUID' })
  productId: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Quantity must be a valid number with max 2 decimal places',
    },
  )
  @Min(0, { message: 'Quantity must be greater than or equal to 0' })
  quantity: number;

  @Column({
    name: 'reserved_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message:
        'Reserved quantity must be a valid number with max 2 decimal places',
    },
  )
  @Min(0, { message: 'Reserved quantity must be greater than or equal to 0' })
  reservedQuantity: number;

  @Column({
    name: 'average_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    nullable: true,
  })
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Average cost must be a valid number with max 2 decimal places',
    },
  )
  @Min(0, { message: 'Average cost must be greater than or equal to 0' })
  averageCost?: number;

  @UpdateDateColumn({ name: 'last_updated' })
  lastUpdated: Date;

  // Relations
  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // Helper methods
  get availableQuantity(): number {
    return Number(this.quantity) - Number(this.reservedQuantity);
  }

  get totalValue(): number {
    return Number(this.quantity) * Number(this.averageCost || 0);
  }

  get availableValue(): number {
    return this.availableQuantity * Number(this.averageCost || 0);
  }

  get isLowStock(): boolean {
    if (!this.product) return false;
    return Number(this.quantity) <= this.product.minStockLevel;
  }

  get needsRestock(): boolean {
    if (!this.product) return false;
    return Number(this.quantity) <= this.product.reorderPoint;
  }

  get stockStatus():
    | 'in_stock'
    | 'low_stock'
    | 'out_of_stock'
    | 'needs_restock' {
    const qty = Number(this.quantity);

    if (qty === 0) return 'out_of_stock';
    if (this.needsRestock) return 'needs_restock';
    if (this.isLowStock) return 'low_stock';
    return 'in_stock';
  }

  // Method to check if we can fulfill an order
  canFulfill(requestedQuantity: number): boolean {
    return this.availableQuantity >= requestedQuantity;
  }

  // Method to reserve quantity
  reserve(quantity: number): void {
    if (this.availableQuantity < quantity) {
      throw new Error('Not enough available quantity to reserve');
    }
    this.reservedQuantity = Number(this.reservedQuantity) + quantity;
  }

  // Method to release reserved quantity
  releaseReservation(quantity: number): void {
    const newReserved = Number(this.reservedQuantity) - quantity;
    this.reservedQuantity = Math.max(0, newReserved);
  }

  // Method to update average cost using weighted average
  updateAverageCost(newQuantity: number, newCost: number): void {
    if (newQuantity <= 0) return;

    const currentQuantity = Number(this.quantity);
    const currentCost = Number(this.averageCost || 0);

    const totalCurrentValue = currentQuantity * currentCost;
    const newValue = newQuantity * newCost;
    const totalQuantity = currentQuantity + newQuantity;

    if (totalQuantity > 0) {
      this.averageCost = (totalCurrentValue + newValue) / totalQuantity;
    }
  }
}
