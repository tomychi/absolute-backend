import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { InvoiceItemEntity } from './invoice-item.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { BranchEntity } from '../../branch/entities/branch.entity';
import { CompanyEntity } from '../../company/entities/company.entity';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  CANCELLED = 'CANCELLED',
  PAID = 'PAID',
}

@Entity({ name: 'invoice' })
export class InvoiceEntity extends BaseEntity {
  @Column({ unique: true })
  invoiceNumber: string;

  @ManyToOne(() => CustomerEntity, (customer) => customer.invoices)
  customer: CustomerEntity;

  @ManyToOne(() => BranchEntity, (branch) => branch.invoices)
  branch: BranchEntity;

  @ManyToOne(() => UserEntity, (user) => user.invoices)
  user: UserEntity;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tax: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ nullable: true })
  note?: string;

  @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status: InvoiceStatus;

  @OneToMany(() => InvoiceItemEntity, (item) => item.invoice)
  items: InvoiceItemEntity[];

  @ManyToOne(() => CompanyEntity, (company) => company.invoices)
  company: CompanyEntity;
}
