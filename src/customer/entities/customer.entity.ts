import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { CompanyEntity } from '../../company/entities/company.entity';
import { InvoiceEntity } from '../../invoice/entities/invoice.entity';

@Entity({ name: 'customer' })
export class CustomerEntity extends BaseEntity {
  @Column({ default: false })
  isGeneric: boolean;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @ManyToOne(() => CompanyEntity, (company) => company.customers)
  company: CompanyEntity;

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.customer)
  invoices: InvoiceEntity[];
}
