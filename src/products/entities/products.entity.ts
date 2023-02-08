import { BaseEntity } from '../../config/base.entity';
import { IProduct } from 'src/interfaces/product.interface';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'products' })
export class ProductsEntity extends BaseEntity implements IProduct {
  @Column({ unique: true })
  name: string;

  @Column()
  model: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column()
  stock: number;
}
