import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDecimal,
  IsBoolean,
  IsObject,
  MaxLength,
  MinLength,
  Matches,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BranchType, BusinessHours } from '../entities/branch.entity';

export class CreateBranchDto {
  @ApiProperty({
    example: 'Tienda Centro',
    description: 'Branch name',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Branch name must be a string' })
  @MinLength(2, { message: 'Branch name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Branch name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    example: 'TC001',
    description: 'Branch code (unique per company)',
    pattern: '^[A-Z0-9-_]+$',
  })
  @IsString({ message: 'Branch code must be a string' })
  @MinLength(2, { message: 'Branch code must be at least 2 characters long' })
  @MaxLength(20, { message: 'Branch code must not exceed 20 characters' })
  @Matches(/^[A-Z0-9-_]+$/, {
    message:
      'Branch code must contain only uppercase letters, numbers, hyphens, and underscores',
  })
  code: string;

  @ApiProperty({
    example: 'retail',
    description: 'Branch type',
    enum: BranchType,
  })
  @IsEnum(BranchType, { message: 'Type must be a valid branch type' })
  type: BranchType;

  @ApiPropertyOptional({
    example: '123 Main Street, City Center, State 12345',
    description: 'Branch address',
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(500, { message: 'Address must not exceed 500 characters' })
  address?: string;

  @ApiPropertyOptional({
    example: '+1-555-123-4567',
    description: 'Branch phone number',
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone must not exceed 20 characters' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'branch@company.com',
    description: 'Branch email address',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    example: 'uuid-manager-id',
    description: 'Manager user ID',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Manager ID must be a valid UUID' })
  managerId?: string;

  @ApiPropertyOptional({
    example: -34.6037,
    description: 'Branch latitude',
  })
  @IsOptional()
  @IsDecimal({}, { message: 'Latitude must be a valid decimal number' })
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({
    example: -58.3816,
    description: 'Branch longitude',
  })
  @IsOptional()
  @IsDecimal({}, { message: 'Longitude must be a valid decimal number' })
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Business hours for each day of the week',
    example: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true },
    },
  })
  @IsOptional()
  @IsObject({ message: 'Business hours must be an object' })
  businessHours?: BusinessHours;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the branch is active',
  })
  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether this is the main branch',
  })
  @IsOptional()
  @IsBoolean({ message: 'Is main must be a boolean' })
  isMain?: boolean;
}
