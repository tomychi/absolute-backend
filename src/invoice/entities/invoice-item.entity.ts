import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { InvoiceEntity } from './invoice.entity';
import { ProductEntity } from '../../product/entities/product.entity';

@Entity({ name: 'invoice_item' })
export class InvoiceItemEntity extends BaseEntity {
  @ManyToOne(() => InvoiceEntity, (invoice) => invoice.items, {
    onDelete: 'CASCADE',
  })
  invoice: InvoiceEntity;

  @ManyToOne(() => ProductEntity)
  product: ProductEntity;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;
}
