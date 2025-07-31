import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  Length,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCustomerDto {
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @Length(1, 100, {
    message: 'First name must be between 1 and 100 characters',
  })
  @Transform(({ value }) => value?.trim())
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @Length(1, 100, { message: 'Last name must be between 1 and 100 characters' })
  @Transform(({ value }) => value?.trim())
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Tax ID must be a string' })
  @Length(1, 50, { message: 'Tax ID must be between 1 and 50 characters' })
  @Transform(({ value }) => value?.trim())
  taxId?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Length(1, 20, { message: 'Phone must be between 1 and 20 characters' })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  // Custom validation: at least one identification field is required
  @ValidateIf((o) => !o.firstName && !o.lastName && !o.email && !o.taxId)
  @IsNotEmpty({
    message: 'At least one of firstName, lastName, email, or taxId is required',
  })
  _atLeastOneField?: any;
}
