import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Company } from '../entities/company.entity';

export class CompanyResponseDto {
  @ApiProperty({ example: 'uuid-here', description: 'Company ID' })
  id: string;

  @ApiProperty({ example: 'Tech Solutions Inc.', description: 'Company name' })
  name: string;

  @ApiPropertyOptional({ example: '12-3456789-0', description: 'Tax ID' })
  taxId?: string;

  @ApiPropertyOptional({
    example: '123 Main St, City, State',
    description: 'Address',
  })
  address?: string;

  @ApiPropertyOptional({ example: '+1-555-123-4567', description: 'Phone' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'contact@techsolutions.com',
    description: 'Email',
  })
  email?: string;

  @ApiPropertyOptional({
    example: 'https://www.techsolutions.com',
    description: 'Website',
  })
  website?: string;

  @ApiPropertyOptional({
    example: 'Leading technology provider',
    description: 'Description',
  })
  description?: string;

  @ApiProperty({ example: true, description: 'Whether company is active' })
  isActive: boolean;

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

  @ApiProperty({ example: 'Tech Solutions Inc.', description: 'Display name' })
  displayName: string;

  // Static method to transform Company entity to DTO
  static fromEntity(company: Company): CompanyResponseDto {
    return {
      id: company.id,
      name: company.name,
      taxId: company.taxId,
      address: company.address,
      phone: company.phone,
      email: company.email,
      website: company.website,
      description: company.description,
      isActive: company.isActive,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      displayName: company.displayName,
    };
  }
}
