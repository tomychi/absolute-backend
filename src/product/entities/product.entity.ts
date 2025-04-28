import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { CompanyEntity } from '../../company/entities/company.entity';
import { InventoryEntity } from '../../inventory/entities/inventory.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'product' })
export class ProductEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ unique: true })
  upc: string;

  @Column({ unique: true })
  sku: string;

  @ManyToOne(() => CompanyEntity, (company) => company.products)
  company: CompanyEntity;

  @OneToMany(() => InventoryEntity, (inventory) => inventory.product)
  inventories: InventoryEntity[];

  @Exclude()
  @Column({ default: false })
  isDeleted: boolean;
}
