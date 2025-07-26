import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Branch, BranchType } from '../entities/branch.entity';

export class BranchSummaryDto {
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

  @ApiProperty({ example: true, description: 'Whether branch is active' })
  isActive: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether this is the main branch',
  })
  isMain: boolean;

  @ApiPropertyOptional({ example: 'John Manager', description: 'Manager name' })
  managerName?: string;

  @ApiPropertyOptional({
    example: '123 Main Street',
    description: 'Branch address',
  })
  address?: string;

  @ApiProperty({
    example: true,
    description: 'Whether branch is currently open',
  })
  isCurrentlyOpen: boolean;

  // Static method to create summary from branch entity
  static fromEntity(branch: Branch): BranchSummaryDto {
    return {
      id: branch.id,
      name: branch.name,
      code: branch.code,
      type: branch.type,
      isActive: branch.isActive,
      isMain: branch.isMain,
      managerName: branch.manager?.fullName,
      address: branch.address,
      isCurrentlyOpen: branch.isCurrentlyOpen(),
    };
  }
}
