import { BaseEntity } from '../../config/base.entity';
import { ROLES } from '../../interfaces/roles';
import { IUser } from '../../interfaces/user.interface';
import { Column, Entity, OneToMany } from 'typeorm';
import { UsersCompaniesEntity } from './usersCompanies.entity';
import { Exclude } from 'class-transformer';

@Entity({ name: 'users' })
export class UsersEntity extends BaseEntity implements IUser {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column()
  address: string;

  @Column({
    default: 'https://img.icons8.com/officel/16/null/gender-neutral-user.png',
  })
  image: string;

  @Column({ type: 'enum', enum: ROLES, default: ROLES.BASIC })
  role: ROLES;

  @OneToMany(
    () => UsersCompaniesEntity,
    (usersCompanies) => usersCompanies.user,
  )
  companiesIncludes: UsersCompaniesEntity[];
}
