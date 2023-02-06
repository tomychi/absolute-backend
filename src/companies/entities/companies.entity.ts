import { BaseEntity } from '../../config/base.entity';
import { ICompany } from '../../interfaces/company.interface';
import { Column, Entity, OneToMany } from 'typeorm';
import { UsersCompaniesEntity } from '../../users/entities/usersCompanies.entity';

@Entity({ name: 'companies' })
export class CompaniesEntity extends BaseEntity implements ICompany {
  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(
    () => UsersCompaniesEntity,
    (usersCompanies) => usersCompanies.company,
  )
  usersIncludes: UsersCompaniesEntity[];
}
