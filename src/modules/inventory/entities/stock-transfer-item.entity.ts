import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNumber, IsUUID, Min } from 'class-validator';
import { StockTransfer } from './stock-transfer.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('stock_transfer_items')
@Index(['transferId'])
@Index(['productId'])
export class StockTransferItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transfer_id' })
  @IsUUID(4, { message: 'Transfer ID must be a valid UUID' })
  transferId: string;

  @Column({ name: 'product_id' })
  @IsUUID(4, { message: 'Product ID must be a valid UUID' })
  productId: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Quantity must be a valid number with max 2 decimal places',
    },
  )
  @Min(0.01, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @Column({
    name: 'unit_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Unit cost must be a valid number with max 2 decimal places',
    },
  )
  @Min(0, { message: 'Unit cost must be greater than or equal to 0' })
  unitCost?: number;

  // Relations
  @ManyToOne(() => StockTransfer, (transfer) => transfer.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transfer_id' })
  transfer: StockTransfer;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // Helper methods
  get totalCost(): number {
    return Number(this.quantity) * Number(this.unitCost || 0);
  }

  get itemSummary(): string {
    return `${this.quantity} x ${this.product?.name || 'Unknown Product'}`;
  }
}
