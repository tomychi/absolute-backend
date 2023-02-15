import { BaseEntity } from '../../config/base.entity';
import { ILocation } from 'src/interfaces/location.interface';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CompaniesEntity } from '../../companies/entities/companies.entity';
import { LocationsProductsEntity } from './locationsProducts.entity';

@Entity({ name: 'locations' })
export class LocationsEntity extends BaseEntity implements ILocation {
  @Column()
  province: string;

  @Column()
  city: string;

  @Column({ unique: true })
  address: string;

  @Column()
  phone: string;

  @Column({
    default: 'https://img.icons8.com/officel/16/null/small-business.png',
  })
  image: string;

  // relacion con la company
  @ManyToOne(() => CompaniesEntity, (company) => company.locations)
  company: CompaniesEntity;

  // relacion con muchos productos
  @OneToMany(
    () => LocationsProductsEntity,
    (locationsProducts) => locationsProducts.location,
  )
  productsIncludes: LocationsProductsEntity[];
}
