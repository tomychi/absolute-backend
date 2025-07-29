import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
} from 'class-validator';
import { Branch } from '../../branches/entities/branch.entity';
import { User } from '../../users/entities/user.entity';
import { StockTransferItem } from './stock-transfer-item.entity';

export enum StockTransferStatus {
  PENDING = 'pending', // Created but not sent
  IN_TRANSIT = 'in_transit', // Sent but not received
  COMPLETED = 'completed', // Received and processed
  CANCELLED = 'cancelled', // Cancelled before completion
}

@Entity('stock_transfers')
@Index(['fromBranchId'])
@Index(['toBranchId'])
@Index(['status'])
@Index(['transferDate'])
@Index(['userId'])
export class StockTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'from_branch_id' })
  @IsUUID(4, { message: 'From branch ID must be a valid UUID' })
  fromBranchId: string;

  @Column({ name: 'to_branch_id' })
  @IsUUID(4, { message: 'To branch ID must be a valid UUID' })
  toBranchId: string;

  @Column({ name: 'user_id' })
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId: string;

  @Column({
    type: 'enum',
    enum: StockTransferStatus,
    default: StockTransferStatus.PENDING,
  })
  @IsEnum(StockTransferStatus, {
    message: 'Status must be a valid transfer status',
  })
  status: StockTransferStatus;

  @Column({ name: 'transfer_date' })
  @IsDateString({}, { message: 'Transfer date must be a valid date' })
  transferDate: Date;

  @Column({ name: 'completed_date', nullable: true })
  @IsOptional()
  @IsDateString({}, { message: 'Completed date must be a valid date' })
  completedDate?: Date;

  @Column({ name: 'completed_by', nullable: true })
  @IsOptional()
  @IsUUID(4, { message: 'Completed by must be a valid UUID' })
  completedBy?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_branch_id' })
  fromBranch: Branch;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_branch_id' })
  toBranch: Branch;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'completed_by' })
  completedByUser?: User;

  @OneToMany(() => StockTransferItem, (item) => item.transfer, {
    cascade: true,
    eager: false,
  })
  items: StockTransferItem[];

  // Helper methods
  get statusDisplayName(): string {
    const statusNames = {
      [StockTransferStatus.PENDING]: 'Pending',
      [StockTransferStatus.IN_TRANSIT]: 'In Transit',
      [StockTransferStatus.COMPLETED]: 'Completed',
      [StockTransferStatus.CANCELLED]: 'Cancelled',
    };
    return statusNames[this.status] || this.status;
  }

  get canBeCancelled(): boolean {
    return (
      this.status === StockTransferStatus.PENDING ||
      this.status === StockTransferStatus.IN_TRANSIT
    );
  }

  get canBeCompleted(): boolean {
    return this.status === StockTransferStatus.IN_TRANSIT;
  }

  get totalItems(): number {
    return this.items?.length || 0;
  }

  get totalQuantity(): number {
    if (!this.items) return 0;
    return this.items.reduce((total, item) => total + Number(item.quantity), 0);
  }

  get totalValue(): number {
    if (!this.items) return 0;
    return this.items.reduce(
      (total, item) =>
        total + Number(item.quantity) * Number(item.unitCost || 0),
      0,
    );
  }

  get transferSummary(): string {
    return `Transfer from ${this.fromBranch?.name} to ${this.toBranch?.name} - ${this.totalItems} items`;
  }
}
