import { ApiProperty } from '@nestjs/swagger';
import { ModuleType, UserPermission } from '../entities/user-permission.entity';
import { UserCompany } from '../entities/user-company.entity';

export class ModulePermissionDto {
  @ApiProperty({
    example: 'products',
    description: 'Module name',
    enum: ModuleType,
  })
  module: ModuleType;

  @ApiProperty({ example: true, description: 'Can read permission' })
  canRead: boolean;

  @ApiProperty({ example: true, description: 'Can write permission' })
  canWrite: boolean;

  @ApiProperty({ example: false, description: 'Can delete permission' })
  canDelete: boolean;

  @ApiProperty({ example: true, description: 'Can export permission' })
  canExport: boolean;

  @ApiProperty({ example: false, description: 'Can import permission' })
  canImport: boolean;
}

export class UserPermissionsResponseDto {
  @ApiProperty({
    example: 'uuid-user-company-id',
    description: 'User-company relationship ID',
  })
  userCompanyId: string;

  @ApiProperty({ example: 'uuid-company-id', description: 'Company ID' })
  companyId: string;

  @ApiProperty({ example: 'manager', description: 'User role in company' })
  role: string;

  @ApiProperty({ example: 3, description: 'Hierarchy level' })
  hierarchyLevel: number;

  @ApiProperty({
    description: 'Permissions by module',
    type: [ModulePermissionDto],
  })
  permissions: ModulePermissionDto[];

  // Static method to transform entity to DTO
  static fromEntity(userCompany: UserCompany): UserPermissionsResponseDto {
    return {
      userCompanyId: userCompany.id,
      companyId: userCompany.companyId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      role: userCompany.accessLevel?.name || 'unknown',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      hierarchyLevel: userCompany.accessLevel?.hierarchyLevel || 0,
      permissions:
        userCompany.permissions?.map((perm: UserPermission) => ({
          module: perm.module,
          canRead: perm.canRead,
          canWrite: perm.canWrite,
          canDelete: perm.canDelete,
          canExport: perm.canExport,
          canImport: perm.canImport,
        })) || [],
    };
  }
}
