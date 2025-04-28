import { Column, Entity, OneToMany } from 'typeorm';
import { ROLES } from '../../constants/roles';
import { IUser } from '../../interfaces/user.interface';
import { UserCompanyEntity } from './userCompany.entity';
import { BaseEntity } from '../../config/base.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity implements IUser {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ type: 'enum', enum: ROLES, default: ROLES.USER })
  role: ROLES;

  @OneToMany(() => UserCompanyEntity, (userCompany) => userCompany.user)
  companyIncludes: UserCompanyEntity[];
}
