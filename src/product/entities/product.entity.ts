import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { CompanyEntity } from '../../company/entities/company.entity';
import { InventoryEntity } from '../../inventory/entities/inventory.entity';
import { StockMovementEntity } from '../../stock/entities/stockMovement.entity';

@Entity({ name: 'product' })
export class ProductEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  category: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  upc: string;

  @Column()
  sku: string;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne(() => CompanyEntity, (company) => company.products)
  company: CompanyEntity;

  @OneToMany(() => InventoryEntity, (inventory) => inventory.product)
  inventories: InventoryEntity[];

  @OneToMany(() => StockMovementEntity, (movement) => movement.product)
  stockMovements: StockMovementEntity[];
}
