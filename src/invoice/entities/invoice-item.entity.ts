import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { InvoiceEntity } from './invoice.entity';
import { ProductVariantEntity } from '../../product/entities/product-variant.entity';

@Entity({ name: 'invoice_item' })
export class InvoiceItemEntity extends BaseEntity {
  @ManyToOne(() => InvoiceEntity, (invoice) => invoice.items)
  invoice: InvoiceEntity;

  @ManyToOne(() => ProductVariantEntity)
  productVariant: ProductVariantEntity;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;
}
