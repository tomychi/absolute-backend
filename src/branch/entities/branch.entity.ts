import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { InventoryEntity } from '../../inventory/entities/inventory.entity';
import { CompanyEntity } from '../../company/entities/company.entity';
import { BaseEntity } from '../../config/base.entity';
import { InvoiceEntity } from 'src/invoice/entities/invoice.entity';

@Entity({ name: 'branch' })
export class BranchEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  location: string;

  @ManyToOne(() => CompanyEntity, (company) => company.branches)
  company: CompanyEntity;

  @OneToMany(() => InventoryEntity, (inventory) => inventory.branch)
  inventories: InventoryEntity[];

  @OneToMany(() => InvoiceEntity, (invoice) => invoice.branch)
  invoices: InvoiceEntity[];
}
