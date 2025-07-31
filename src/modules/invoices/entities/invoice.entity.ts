import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import {
  IsUUID,
  IsNumber,
  IsDate,
  IsOptional,
  Min,
  IsString,
  Length,
  IsEnum,
} from 'class-validator';
import { Branch } from '../../branches/entities/branch.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { User } from '../../users/entities/user.entity';
import { InvoiceItem } from './invoice-item.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

@Entity('invoices')
@Index(['branchId', 'issuedAt'])
@Index(['customerId', 'issuedAt'])
@Index(['status', 'issuedAt'])
@Index(['invoiceNumber'], { unique: true })
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_number', unique: true })
  @IsString({ message: 'Invoice number must be a string' })
  @Length(1, 50, {
    message: 'Invoice number must be between 1 and 50 characters',
  })
  invoiceNumber: string;

  @Column({ name: 'branch_id' })
  @IsUUID(4, { message: 'Branch ID must be a valid UUID' })
  branchId: string;

  @Column({ name: 'customer_id' })
  @IsUUID(4, { message: 'Customer ID must be a valid UUID' })
  customerId: string;

  @Column({ name: 'user_id' })
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  @IsEnum(InvoiceStatus, { message: 'Status must be a valid InvoiceStatus' })
  status: InvoiceStatus;

  @Column({
    name: 'subtotal_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Subtotal must be a valid number' },
  )
  @Min(0, { message: 'Subtotal must be positive' })
  subtotalAmount: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Tax amount must be a valid number' },
  )
  @Min(0, { message: 'Tax amount must be positive' })
  taxAmount: number;

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

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Total amount must be a valid number' },
  )
  @Min(0, { message: 'Total amount must be positive' })
  totalAmount: number;

  @Column({
    name: 'tax_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Tax rate must be a valid number' },
  )
  @Min(0, { message: 'Tax rate must be positive' })
  taxRate: number;

  @Column({
    name: 'discount_rate',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Discount rate must be a valid number' },
  )
  @Min(0, { message: 'Discount rate must be positive' })
  discountRate: number;

  @Column({ name: 'due_date', nullable: true })
  @IsOptional()
  @IsDate({ message: 'Due date must be a valid date' })
  dueDate?: Date;

  @Column({ name: 'paid_date', nullable: true })
  @IsOptional()
  @IsDate({ message: 'Paid date must be a valid date' })
  paidDate?: Date;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @Column({ name: 'issued_at', default: () => 'CURRENT_TIMESTAMP' })
  @IsDate({ message: 'Issued at must be a valid date' })
  issuedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, {
    cascade: true,
    eager: false,
  })
  items: InvoiceItem[];

  // Virtual properties
  get isOverdue(): boolean {
    if (!this.dueDate || this.status === InvoiceStatus.PAID) {
      return false;
    }
    return new Date() > this.dueDate;
  }

  get isPaid(): boolean {
    return this.status === InvoiceStatus.PAID;
  }

  get daysPastDue(): number {
    if (!this.isOverdue) return 0;
    const diffTime = new Date().getTime() - this.dueDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get itemsCount(): number {
    return this.items?.length || 0;
  }

  // Business methods
  @BeforeInsert()
  @BeforeUpdate()
  calculateTotals(): void {
    this.subtotalAmount = this.subtotalAmount || 0;
    this.taxAmount = this.subtotalAmount * (this.taxRate / 100);
    this.discountAmount = this.subtotalAmount * (this.discountRate / 100);
    this.totalAmount =
      this.subtotalAmount + this.taxAmount - this.discountAmount;
  }

  canBeModified(): boolean {
    return this.status === InvoiceStatus.DRAFT;
  }

  canBePaid(): boolean {
    return [InvoiceStatus.PENDING, InvoiceStatus.OVERDUE].includes(this.status);
  }

  canBeCancelled(): boolean {
    return this.status !== InvoiceStatus.PAID;
  }

  markAsPaid(paidDate?: Date): void {
    this.status = InvoiceStatus.PAID;
    this.paidDate = paidDate || new Date();
  }

  markAsPending(): void {
    this.status = InvoiceStatus.PENDING;
    this.paidDate = null;
  }

  cancel(): void {
    this.status = InvoiceStatus.CANCELLED;
  }

  updateStatus(): void {
    if (this.status === InvoiceStatus.PENDING && this.isOverdue) {
      this.status = InvoiceStatus.OVERDUE;
    }
  }

  // Helper method to generate invoice number
  static generateInvoiceNumber(
    companyPrefix: string,
    sequence: number,
  ): string {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    return `${companyPrefix}-${year}${month}-${sequence.toString().padStart(6, '0')}`;
  }
}
