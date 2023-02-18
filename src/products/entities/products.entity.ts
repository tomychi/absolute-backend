import { BaseEntity } from '../../config/base.entity';
import { IProduct } from 'src/interfaces/product.interface';
import { Column, Entity, OneToMany } from 'typeorm';
import { LocationsProductsEntity } from '../../locations/entities/locationsProducts.entity';

@Entity({ name: 'products' })
export class ProductsEntity extends BaseEntity implements IProduct {
  @Column({ unique: true })
  name: string;

  @Column()
  price: number;

  @Column({
    default:
      'https://res.cloudinary.com/db2gtt9hk/image/upload/v1676701165/default/wqkjzjppjplc3hyjbzo2.jpg',
  })
  image: string;

  // Relacion con muchas locations
  @OneToMany(
    () => LocationsProductsEntity,
    (locationsProducts) => locationsProducts.product,
  )
  locationsIncludes: LocationsProductsEntity[];
}
