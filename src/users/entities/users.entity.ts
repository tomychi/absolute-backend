import { BaseEntity } from '../../config/base.entity';
import { ROLES } from '../../interfaces/roles';
import { IUser } from '../../interfaces/user.interface';
import { Column, Entity, OneToMany } from 'typeorm';
import { UsersCompaniesEntity } from './usersCompanies.entity';

@Entity({ name: 'users' })
export class UsersEntity extends BaseEntity implements IUser {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  age: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  address: string;

  @Column({ type: 'enum', enum: ROLES })
  role: ROLES;

  @OneToMany(
    () => UsersCompaniesEntity,
    (usersCompanies) => usersCompanies.user,
  )
  companiesIncludes: UsersCompaniesEntity[];
}