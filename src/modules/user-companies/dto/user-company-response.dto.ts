import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  UserCompany,
  UserCompanyStatus,
} from '../entities/user-company.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { CompanyResponseDto } from '../../companies/dto/company-response.dto';

export class UserCompanyResponseDto {
  @ApiProperty({
    example: 'uuid-here',
    description: 'User-company relationship ID',
  })
  id: string;

  @ApiProperty({ example: 'uuid-user-id', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 'uuid-company-id', description: 'Company ID' })
  companyId: string;

  @ApiProperty({ example: 3, description: 'Access level ID' })
  accessLevelId: number;

  @ApiProperty({ example: 'manager', description: 'Access level name' })
  roleName: string;

  @ApiProperty({
    example: 'active',
    description: 'User status in company',
    enum: UserCompanyStatus,
  })
  status: UserCompanyStatus;

  @ApiProperty({ example: true, description: 'Whether relationship is active' })
  isActive: boolean;

  @ApiPropertyOptional({
    example: '2024-07-25T01:00:00Z',
    description: 'When user joined company',
  })
  joinedAt?: Date;

  @ApiPropertyOptional({
    example: '2024-07-25T02:00:00Z',
    description: 'Last activity timestamp',
  })
  lastActivity?: Date;

  @ApiProperty({
    example: '2024-07-25T01:00:00Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'User information',
    type: UserResponseDto,
  })
  user?: UserResponseDto;

  @ApiPropertyOptional({
    description: 'Company information',
    type: CompanyResponseDto,
  })
  company?: CompanyResponseDto;

  @ApiPropertyOptional({
    example: 'uuid-inviter-id',
    description: 'ID of user who sent invitation',
  })
  invitedBy?: string;

  // Static method to transform entity to DTO
  static fromEntity(userCompany: UserCompany): UserCompanyResponseDto {
    return {
      id: userCompany.id,
      userId: userCompany.userId,
      companyId: userCompany.companyId,
      accessLevelId: userCompany.accessLevelId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      roleName: userCompany.accessLevel?.name || 'unknown',
      status: userCompany.status,
      isActive: userCompany.isActiveField,
      joinedAt: userCompany.joinedAt,
      lastActivity: userCompany.lastActivity,
      createdAt: userCompany.createdAt,
      user: userCompany.user
        ? UserResponseDto.fromEntity(userCompany.user)
        : undefined,
      company: userCompany.company
        ? CompanyResponseDto.fromEntity(userCompany.company)
        : undefined,
      invitedBy: userCompany.invitedBy,
    };
  }
}
