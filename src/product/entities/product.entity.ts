import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { CompanyEntity } from '../../company/entities/company.entity';
import { ProductVariantEntity } from './product-variant.entity';

@Entity({ name: 'product' })
export class ProductEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  category: string;

  @Column({ default: false })
  isDeleted: boolean;

  @ManyToOne(() => CompanyEntity, (company) => company.products)
  company: CompanyEntity;

  @OneToMany(() => ProductVariantEntity, (variant) => variant.product)
  variants: ProductVariantEntity[];
}
