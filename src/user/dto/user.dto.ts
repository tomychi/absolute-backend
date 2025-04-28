import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ROLES } from 'src/constants/roles';
import { ACCESS_LEVEL } from '../../constants/roles';
import { ApiProperty } from '@nestjs/swagger';

export class UserCreateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ROLES)
  role?: ROLES;
}

export class UserUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(3)
  firstName?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(3)
  lastName?: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ROLES)
  role?: ROLES;
}

export class UserToCompanyCreateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ACCESS_LEVEL)
  accessLevel: ACCESS_LEVEL;
}
