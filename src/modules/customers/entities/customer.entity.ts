import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  Length,
  IsPhoneNumber,
} from 'class-validator';
import { Company } from '../../companies/entities/company.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { BaseEntity } from '../../../config/base.entity';

@Entity('customers')
@Index(['companyId', 'taxId'])
@Index(['companyId', 'email'])
export class Customer extends BaseEntity {
  @Column({ name: 'first_name', nullable: true })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @Length(1, 100, {
    message: 'First name must be between 1 and 100 characters',
  })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Length(1, 100, { message: 'Last name must be between 1 and 100 characters' })
  lastName?: string;

  @Column({ name: 'tax_id', nullable: true })
  @IsOptional()
  @IsString({ message: 'Tax ID must be a string' })
  @Length(1, 50, { message: 'Tax ID must be between 1 and 50 characters' })
  taxId?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Length(1, 20, { message: 'Phone must be between 1 and 20 characters' })
  phone?: string;

  @Column({ name: 'company_id' })
  @IsUUID(4, { message: 'Company ID must be a valid UUID' })
  companyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Company, (company) => company.customers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Invoice, (invoice) => invoice.customer)
  invoices: Invoice[];

  // Virtual properties
  get fullName(): string {
    const parts = [this.firstName, this.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Unknown Customer';
  }

  get displayName(): string {
    if (this.firstName || this.lastName) {
      return this.fullName;
    }
    return this.email || this.taxId || 'Unknown Customer';
  }

  // Business methods
  isComplete(): boolean {
    return !!((this.firstName && this.lastName) || this.taxId || this.email);
  }

  hasContactInfo(): boolean {
    return !!(this.email || this.phone);
  }

  toSummary() {
    return {
      id: this.id,
      displayName: this.displayName,
      email: this.email,
      phone: this.phone,
      taxId: this.taxId,
      isComplete: this.isComplete(),
    };
  }
}
