import {
  IsEmail,
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  MinLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InviteUserDto {
  @ApiProperty({
    example: 'newuser@company.com',
    description: 'Email of user to invite',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of user to invite',
  })
  @IsString({ message: 'First name must be a string' })
  @MinLength(1, { message: 'First name is required' })
  firstName: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'Last name of user to invite',
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @ApiProperty({
    example: 'uuid-company-id',
    description: 'Company ID to invite user to',
  })
  @IsUUID(4, { message: 'Company ID must be a valid UUID' })
  companyId: string;

  @ApiProperty({
    example: 2,
    description:
      'Access level ID to assign (1=viewer, 2=employee, 3=manager, 4=admin)',
  })
  @IsInt({ message: 'Access level ID must be an integer' })
  @Min(1, { message: 'Access level ID must be at least 1' })
  accessLevelId: number;

  @ApiPropertyOptional({
    example: 'Welcome to our team! You have been invited to join our company.',
    description: 'Custom invitation message',
  })
  @IsOptional()
  @IsString({ message: 'Message must be a string' })
  message?: string;
}
