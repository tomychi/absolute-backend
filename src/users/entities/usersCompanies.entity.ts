import { BaseEntity } from '../../config/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { ACCESS_LEVEL } from '../../interfaces/roles';
import { UsersEntity } from './users.entity';
import { CompaniesEntity } from '../../companies/entities/companies.entity';

@Entity({ name: 'users_companies' })
export class UsersCompaniesEntity extends BaseEntity {
  @Column({ type: 'enum', enum: ACCESS_LEVEL })
  accessLevel: ACCESS_LEVEL;

  @ManyToOne(() => UsersEntity, (user) => user.companiesIncludes)
  user: UsersEntity;

  @ManyToOne(() => CompaniesEntity, (company) => company.usersIncludes)
  company: CompaniesEntity;
}
