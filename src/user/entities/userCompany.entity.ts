import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../config/base.entity';
import { ACCESS_LEVEL } from '../../constants/roles';
import { UserEntity } from './user.entity';
import { CompanyEntity } from '../../company/entities/company.entity';

@Entity({ name: 'user_company' })
export class UserCompanyEntity extends BaseEntity {
  @Column({ type: 'enum', enum: ACCESS_LEVEL })
  accessLevel: ACCESS_LEVEL;

  @ManyToOne(() => UserEntity, (user) => user.companyIncludes)
  user: UserEntity;

  @ManyToOne(() => CompanyEntity, (company) => company.usersIncludes)
  company: CompanyEntity;
}
