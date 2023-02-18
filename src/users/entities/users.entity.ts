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

  @Column({
    default: 'calle 2',
  })
  address: string;

  @Column({
    default:
      'https://e7.pngegg.com/pngimages/343/677/png-clipart-computer-icons-user-profile-login-my-account-icon-heroes-black-thumbnail.png',
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
