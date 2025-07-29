import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Branch } from '../../branches/entities/branch.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

export enum StockMovementType {
  PURCHASE = 'purchase', // Purchase from supplier
  SALE = 'sale', // Sale to customer
  ADJUSTMENT = 'adjustment', // Manual adjustment
  TRANSFER_IN = 'transfer_in', // Received from another branch
  TRANSFER_OUT = 'transfer_out', // Sent to another branch
  RETURN = 'return', // Customer return
  LOSS = 'loss', // Loss/damage
  FOUND = 'found', // Found inventory
  INITIAL = 'initial', // Initial stock setup
}

@Entity('stock_movements')
@Index(['branchId', 'productId'])
@Index(['branchId', 'type'])
@Index(['productId', 'type'])
@Index(['createdAt'])
@Index(['userId'])
export class StockMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'branch_id' })
  @IsUUID(4, { message: 'Branch ID must be a valid UUID' })
  branchId: string;

  @Column({ name: 'product_id' })
  @IsUUID(4, { message: 'Product ID must be a valid UUID' })
  productId: string;

  @Column({ name: 'user_id' })
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId: string;

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
  quantity: number; // Positive = in, Negative = out

  @Column({
    type: 'enum',
    enum: StockMovementType,
  })
  @IsEnum(StockMovementType, {
    message: 'Type must be a valid stock movement type',
  })
  type: StockMovementType;

  @Column({ name: 'reference_id', nullable: true })
  @IsOptional()
  @IsUUID(4, { message: 'Reference ID must be a valid UUID' })
  referenceId?: string; // Invoice ID, Transfer ID, etc.

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;

  @Column({
    name: 'cost_per_unit',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  @IsOptional()
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Cost per unit must be a valid number with max 2 decimal places',
    },
  )
  costPerUnit?: number;

  @Column({
    name: 'total_cost',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  @IsOptional()
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Total cost must be a valid number with max 2 decimal places',
    },
  )
  totalCost?: number;

  @Column({
    name: 'previous_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  @IsOptional()
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Previous quantity must be a valid number',
    },
  )
  previousQuantity?: number;

  @Column({
    name: 'new_quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  @IsOptional()
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'New quantity must be a valid number',
    },
  )
  newQuantity?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Helper methods
  get isInbound(): boolean {
    return Number(this.quantity) > 0;
  }

  get isOutbound(): boolean {
    return Number(this.quantity) < 0;
  }

  get absoluteQuantity(): number {
    return Math.abs(Number(this.quantity));
  }

  get typeDisplayName(): string {
    const typeNames = {
      [StockMovementType.PURCHASE]: 'Purchase',
      [StockMovementType.SALE]: 'Sale',
      [StockMovementType.ADJUSTMENT]: 'Adjustment',
      [StockMovementType.TRANSFER_IN]: 'Transfer In',
      [StockMovementType.TRANSFER_OUT]: 'Transfer Out',
      [StockMovementType.RETURN]: 'Return',
      [StockMovementType.LOSS]: 'Loss',
      [StockMovementType.FOUND]: 'Found',
      [StockMovementType.INITIAL]: 'Initial Stock',
    };
    return typeNames[this.type] || this.type;
  }

  get movementDescription(): string {
    const action = this.isInbound ? 'Added' : 'Removed';
    return `${action} ${this.absoluteQuantity} units - ${this.typeDisplayName}`;
  }
}
