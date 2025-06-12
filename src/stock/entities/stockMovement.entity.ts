import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { BranchEntity } from '../../branch/entities/branch.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { StockMovementTypeEntity } from './stockMovementType.entity';

@Entity({ name: 'stock_movement' })
export class StockMovementEntity extends BaseEntity {
  @Column()
  quantity: number;

  @Column()
  reference: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @ManyToOne(() => BranchEntity, (branch) => branch.id)
  branch: BranchEntity;

  @ManyToOne(() => StockMovementTypeEntity, (type) => type.movements)
  movementType: StockMovementTypeEntity;

  @ManyToOne(() => UserEntity, (user) => user.id)
  user: UserEntity;

  @ManyToOne(() => ProductEntity, { nullable: false })
  product: ProductEntity;
}
