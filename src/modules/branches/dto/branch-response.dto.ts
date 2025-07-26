import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Branch, BranchType, BusinessHours } from '../entities/branch.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { CompanyResponseDto } from '../../companies/dto/company-response.dto';

export class BranchResponseDto {
  @ApiProperty({ example: 'uuid-here', description: 'Branch ID' })
  id: string;

  @ApiProperty({ example: 'Tienda Centro', description: 'Branch name' })
  name: string;

  @ApiProperty({ example: 'TC001', description: 'Branch code' })
  code: string;

  @ApiProperty({
    example: 'retail',
    description: 'Branch type',
    enum: BranchType,
  })
  type: BranchType;

  @ApiProperty({
    example: 'Retail Store',
    description: 'Branch type display name',
  })
  typeDisplayName: string;

  @ApiPropertyOptional({
    example: '123 Main Street',
    description: 'Branch address',
  })
  address?: string;

  @ApiPropertyOptional({
    example: '+1-555-123-4567',
    description: 'Phone number',
  })
  phone?: string;

  @ApiPropertyOptional({
    example: 'branch@company.com',
    description: 'Email address',
  })
  email?: string;

  @ApiProperty({ example: true, description: 'Whether branch is active' })
  isActive: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether this is the main branch',
  })
  isMain: boolean;

  @ApiPropertyOptional({ example: -34.6037, description: 'Latitude' })
  latitude?: number;

  @ApiPropertyOptional({ example: -58.3816, description: 'Longitude' })
  longitude?: number;

  @ApiPropertyOptional({ description: 'Business hours' })
  businessHours?: BusinessHours;

  @ApiProperty({
    example: '2024-07-25T01:00:00Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-07-25T01:00:00Z',
    description: 'Last update date',
  })
  updatedAt: Date;

  @ApiProperty({
    example: 'Tienda Centro (TC001)',
    description: 'Display name',
  })
  displayName: string;

  @ApiProperty({
    example: true,
    description: 'Whether branch is currently open',
  })
  isCurrentlyOpen: boolean;

  @ApiPropertyOptional({
    description: 'Manager information',
    type: UserResponseDto,
  })
  manager?: UserResponseDto;

  @ApiPropertyOptional({
    description: 'Company information',
    type: CompanyResponseDto,
  })
  company?: CompanyResponseDto;

  // Static method to transform Branch entity to DTO
  static fromEntity(branch: Branch): BranchResponseDto {
    return {
      id: branch.id,
      name: branch.name,
      code: branch.code,
      type: branch.type,
      typeDisplayName: branch.typeDisplayName,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      isActive: branch.isActive,
      isMain: branch.isMain,
      latitude: branch.latitude ? Number(branch.latitude) : undefined,
      longitude: branch.longitude ? Number(branch.longitude) : undefined,
      businessHours: branch.businessHours,
      createdAt: branch.createdAt,
      updatedAt: branch.updatedAt,
      displayName: branch.displayName,
      isCurrentlyOpen: branch.isCurrentlyOpen(),
      manager: branch.manager
        ? UserResponseDto.fromEntity(branch.manager)
        : undefined,
      company: branch.company
        ? CompanyResponseDto.fromEntity(branch.company)
        : undefined,
    };
  }
}
