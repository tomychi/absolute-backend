import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import {
  IsUUID,
  IsNumber,
  IsString,
  Min,
  Length,
  IsOptional,
} from 'class-validator';
import { Invoice } from './invoice.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_id' })
  @IsUUID(4, { message: 'Invoice ID must be a valid UUID' })
  invoiceId: string;

  @Column({ name: 'product_id' })
  @IsUUID(4, { message: 'Product ID must be a valid UUID' })
  productId: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Quantity must be a valid number' },
  )
  @Min(0.01, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Unit price must be a valid number' },
  )
  @Min(0, { message: 'Unit price must be positive' })
  unitPrice: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Total price must be a valid number' },
  )
  @Min(0, { message: 'Total price must be positive' })
  totalPrice: number;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Discount amount must be a valid number' },
  )
  @Min(0, { message: 'Discount amount must be positive' })
  discountAmount: number;

  @Column({ name: 'product_name' })
  @IsString({ message: 'Product name must be a string' })
  @Length(1, 255, {
    message: 'Product name must be between 1 and 255 characters',
  })
  productName: string;

  @Column({ name: 'product_sku', nullable: true })
  @IsOptional()
  @IsString({ message: 'Product SKU must be a string' })
  productSku?: string;

  @Column({ name: 'product_description', nullable: true })
  @IsOptional()
  @IsString({ message: 'Product description must be a string' })
  productDescription?: string;

  // Relations
  @ManyToOne(() => Invoice, (invoice) => invoice.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // Business methods
  @BeforeInsert()
  @BeforeUpdate()
  calculateTotal(): void {
    this.totalPrice = this.quantity * this.unitPrice - this.discountAmount;
  }

  get effectivePrice(): number {
    return this.unitPrice - this.discountAmount / this.quantity;
  }

  get discountPercentage(): number {
    if (this.unitPrice === 0) return 0;
    return (this.discountAmount / (this.quantity * this.unitPrice)) * 100;
  }

  get itemSummary(): string {
    return `${this.quantity} x ${this.productName} @ ${this.unitPrice}`;
  }
}
