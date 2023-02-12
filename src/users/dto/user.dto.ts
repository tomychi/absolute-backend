import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CompaniesEntity } from 'src/companies/entities/companies.entity';
import { ACCESS_LEVEL, ROLES } from '../../interfaces/roles';
import { UsersEntity } from '../entities/users.entity';

export class UserDTO {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsNotEmpty()
  @IsEnum(ROLES)
  role: ROLES;
}

export class UserUpdateDTO {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  image: string;

  @IsOptional()
  @IsEnum(ROLES)
  role: ROLES;
}

export class UserToCompanyDTO {
  @IsNotEmpty()
  @IsUUID()
  user: UsersEntity;

  @IsNotEmpty()
  @IsUUID()
  company: CompaniesEntity;

  @IsNotEmpty()
  @IsEnum(ACCESS_LEVEL)
  accessLevel: ACCESS_LEVEL;
}
