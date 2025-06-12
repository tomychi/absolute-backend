import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { StockMovementEntity } from './stockMovement.entity';

@Entity({ name: 'stock_movement_type' })
export class StockMovementTypeEntity extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isAddition: boolean;

  @OneToMany(() => StockMovementEntity, (movement) => movement.movementType)
  movements: StockMovementEntity[];
}
