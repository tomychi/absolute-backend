import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Company } from '../entities/company.entity';

export class CompanyPublicDto {
  @ApiProperty({ example: 'uuid-here', description: 'Company ID' })
  id: string;

  @ApiProperty({ example: 'Tech Solutions Inc.', description: 'Company name' })
  name: string;

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

  // Static method for public company info
  static fromEntity(company: Company): CompanyPublicDto {
    return {
      id: company.id,
      name: company.name,
      website: company.website,
      description: company.description,
      isActive: company.isActive,
    };
  }
}
