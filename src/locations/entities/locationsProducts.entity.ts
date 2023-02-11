import { BaseEntity } from '../../config/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { LocationsEntity } from './locations.entity';
import { ProductsEntity } from '../../products/entities/products.entity';

@Entity({ name: 'locations_products' })
export class LocationsProductsEntity extends BaseEntity {
  @Column()
  stock: number;

  @ManyToOne(() => LocationsEntity, (location) => location.productsIncludes)
  location: LocationsEntity;

  @ManyToOne(() => ProductsEntity, (product) => product.locationsIncludes)
  product: ProductsEntity;
}
