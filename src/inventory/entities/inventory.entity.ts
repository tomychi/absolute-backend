import { Entity, Column, ManyToOne } from 'typeorm';
import { BranchEntity } from '../../branch/entities/branch.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { BaseEntity } from '../../config/base.entity';

@Entity({ name: 'inventory' })
export class InventoryEntity extends BaseEntity {
  @Column()
  stock: number;

  @ManyToOne(() => ProductEntity, (product) => product.inventories)
  product: ProductEntity;

  @ManyToOne(() => BranchEntity, (branch) => branch.inventories)
  branch: BranchEntity;
}
