import { BaseEntity } from '../../config/base.entity';
import { IProduct } from 'src/interfaces/product.interface';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'products' })
export class ProductsEntity extends BaseEntity implements IProduct {
  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column({ unique: true })
  stock: number;
}
