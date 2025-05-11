import { BaseEntity } from 'src/config/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity({ name: 'product_variant' })
export class ProductVariantEntity extends BaseEntity {
  @Column()
  variantDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  variantPrice: number;

  @Column({ unique: true })
  sku: string;

  @Column({ unique: true })
  upc: string;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne(() => ProductEntity, (product) => product.variants)
  product: ProductEntity;

  // relaciones con stock, factura, historial...
}
