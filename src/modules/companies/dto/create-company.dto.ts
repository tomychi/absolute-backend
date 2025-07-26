import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  MaxLength,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompanyDto {
  @ApiProperty({
    example: 'Tech Solutions Inc.',
    description: 'Company name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Company name must be a string' })
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Company name must not exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    example: '12-3456789-0',
    description: 'Tax identification number',
  })
  @IsOptional()
  @IsString({ message: 'Tax ID must be a string' })
  @MaxLength(50, { message: 'Tax ID must not exceed 50 characters' })
  taxId?: string;

  @ApiPropertyOptional({
    example: '123 Main St, City, State 12345',
    description: 'Company address',
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(500, { message: 'Address must not exceed 500 characters' })
  address?: string;

  @ApiPropertyOptional({
    example: '+1-555-123-4567',
    description: 'Company phone number',
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone must not exceed 20 characters' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'contact@techsolutions.com',
    description: 'Company email address',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    example: 'https://www.techsolutions.com',
    description: 'Company website',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @ApiPropertyOptional({
    example: 'Leading provider of innovative technology solutions',
    description: 'Company description',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the company is active',
  })
  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive?: boolean;
}
