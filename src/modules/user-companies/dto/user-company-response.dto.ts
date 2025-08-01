import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  UserCompany,
  UserCompanyStatus,
} from '../entities/user-company.entity';
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

  // ✅ SOLUCIÓN: Usar definición manual para el usuario
  @ApiPropertyOptional({
    description: 'User information',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'user-uuid' },
      email: { type: 'string', example: 'user@example.com' },
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
      phone: { type: 'string', example: '+1234567890' },
      isActive: { type: 'boolean', example: true },
      emailVerified: { type: 'boolean', example: false },
      fullName: { type: 'string', example: 'John Doe' },
    },
    example: {
      id: 'user-uuid',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      isActive: true,
      emailVerified: false,
      fullName: 'John Doe',
    },
  })
  user?: any; // ✅ Usar any para evitar circular dependency

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
  static fromEntity(uc: UserCompany): UserCompanyResponseDto {
    return {
      id: uc.id,
      userId: uc.userId,
      companyId: uc.companyId,
      accessLevelId: uc.accessLevelId,
      roleName: uc.accessLevel?.name || 'unknown',
      status: uc.status,
      isActive: uc.isActiveField,
      joinedAt: uc.joinedAt,
      lastActivity: uc.lastActivity,
      createdAt: uc.createdAt,
      // ✅ Mapear solo las propiedades básicas del usuario
      user: uc.user
        ? {
            id: uc.user.id,
            email: uc.user.email,
            firstName: uc.user.firstName,
            lastName: uc.user.lastName,
            phone: uc.user.phone,
            isActive: uc.user.isActive,
            emailVerified: uc.user.emailVerified,
            fullName: `${uc.user.firstName} ${uc.user.lastName || ''}`.trim(),
            // ❌ NO incluir userCompanies aquí para evitar recursión infinita
          }
        : undefined,
      company: uc.company
        ? CompanyResponseDto.fromEntity(uc.company)
        : undefined,
      invitedBy: uc.invitedBy,
    };
  }
}
