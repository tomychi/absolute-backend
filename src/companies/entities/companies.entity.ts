import { BaseEntity } from '../../config/base.entity';
import { ICompany } from '../../interfaces/company.interface';
import { Column, Entity, OneToMany } from 'typeorm';
import { UsersCompaniesEntity } from '../../users/entities/usersCompanies.entity';
import { LocationsEntity } from '../../locations/entities/locations.entity';

@Entity({ name: 'companies' })
export class CompaniesEntity extends BaseEntity implements ICompany {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    default:
      'https://res.cloudinary.com/db2gtt9hk/image/upload/v1676701165/default/wqkjzjppjplc3hyjbzo2.jpg',
  })
  image: string;

  // Relacion con users de 1 a muchos
  @OneToMany(
    () => UsersCompaniesEntity,
    (usersCompanies) => usersCompanies.company,
  )
  usersIncludes: UsersCompaniesEntity[];

  // relacion con las locations
  @OneToMany(() => LocationsEntity, (location) => location.company)
  locations: LocationsEntity[];
}

/**
 *
 * name
 * urlImage
 *
 *
 */
