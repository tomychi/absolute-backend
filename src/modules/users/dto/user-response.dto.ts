import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-here', description: 'User ID' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  firstName: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'User last name' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'User phone' })
  phone?: string;

  @ApiProperty({ example: true, description: 'Whether user is active' })
  isActive: boolean;

  @ApiProperty({ example: false, description: 'Whether email is verified' })
  emailVerified: boolean;

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00Z',
    description: 'Last login date',
  })
  lastLogin?: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Last update date',
  })
  updatedAt: Date;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  fullName: string;

  // ✅ SOLUCIÓN: Usar lazy resolver para evitar circular dependency
  @ApiProperty({
    description: 'List of user companies',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'company-uuid' },
        userId: { type: 'string', example: 'user-uuid' },
        companyId: { type: 'string', example: 'company-uuid' },
        accessLevelId: { type: 'number', example: 3 },
        roleName: { type: 'string', example: 'manager' },
        status: { type: 'string', example: 'active' },
        isActive: { type: 'boolean', example: true },
        joinedAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00Z',
        },
        lastActivity: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00Z',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-01T00:00:00Z',
        },
      },
    },
    example: [
      {
        id: 'company-uuid',
        userId: 'user-uuid',
        companyId: 'company-uuid',
        accessLevelId: 3,
        roleName: 'manager',
        status: 'active',
        isActive: true,
        joinedAt: '2024-01-01T00:00:00Z',
        lastActivity: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ],
  })
  userCompanies: any[]; // ✅ Usar any[] para evitar circular dependency
  // Static method to properly transform User entity to DTO
  //
  // Static method to properly transform User entity to DTO
  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      fullName: `${user.firstName} ${user.lastName || ''}`.trim(),
      // ✅ Aquí puedes seguir mapeando normalmente
      userCompanies:
        user.userCompanies?.map((uc) => ({
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
          // NO incluir objetos completos para evitar recursión infinita
          company: uc.company
            ? {
                id: uc.company.id,
                name: uc.company.name,
                taxId: uc.company.taxId,
              }
            : undefined,
          accessLevel: uc.accessLevel
            ? {
                id: uc.accessLevel.id,
                name: uc.accessLevel.name,
                hierarchyLevel: uc.accessLevel.hierarchyLevel,
              }
            : undefined,
        })) || [],
    };
  }
}
