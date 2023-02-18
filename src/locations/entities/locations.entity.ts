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
    default:
      'https://res.cloudinary.com/db2gtt9hk/image/upload/v1676701165/default/wqkjzjppjplc3hyjbzo2.jpg',
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
