import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export enum AccessLevelName {
  OWNER = 'owner',
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  VIEWER = 'viewer',
}

@Entity('access_levels')
export class AccessLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsString({ message: 'Access level name must be a string' })
  name: AccessLevelName;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @Column({ name: 'hierarchy_level' })
  @IsInt({ message: 'Hierarchy level must be an integer' })
  @Min(1, { message: 'Hierarchy level must be at least 1' })
  @Max(5, { message: 'Hierarchy level must be at most 5' })
  hierarchyLevel: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Relations will be added when UserCompany entity is created
  // @OneToMany(() => UserCompany, userCompany => userCompany.accessLevel)
  // userCompanies: UserCompany[];

  // Static method to get hierarchy levels
  static getHierarchyLevels(): Record<AccessLevelName, number> {
    return {
      [AccessLevelName.OWNER]: 5,
      [AccessLevelName.ADMIN]: 4,
      [AccessLevelName.MANAGER]: 3,
      [AccessLevelName.EMPLOYEE]: 2,
      [AccessLevelName.VIEWER]: 1,
    };
  }

  // Method to check if this level can manage another level
  canManage(targetLevel: AccessLevel): boolean {
    return this.hierarchyLevel > targetLevel.hierarchyLevel;
  }

  // Method to check if this level can perform an action on another level
  canEditRole(targetLevel: AccessLevel): boolean {
    // Only higher hierarchy levels can edit lower ones
    // Owner can edit everyone, Admin can edit Manager/Employee/Viewer, etc.
    return this.hierarchyLevel > targetLevel.hierarchyLevel;
  }

  // Get available permissions for this access level
  getDefaultPermissions(): Record<string, any> {
    const permissions: Record<string, any> = {};

    switch (this.name) {
      case AccessLevelName.OWNER:
        permissions.products = {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canExport: true,
          canImport: true,
        };
        permissions.inventory = {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canExport: true,
          canImport: true,
        };
        permissions.customers = {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canExport: true,
          canImport: true,
        };
        permissions.invoices = {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canExport: true,
          canImport: true,
        };
        permissions.branches = {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canExport: true,
          canImport: true,
        };
        permissions.reports = {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canExport: true,
          canImport: true,
        };
        permissions.settings = {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canExport: true,
          canImport: true,
        };
        permissions.users = {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canExport: true,
          canImport: true,
        };
        break;

      case AccessLevelName.ADMIN:
        permissions.products = {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canExport: true,
          canImport: true,
        };
        permissions.inventory = {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canExport: true,
          canImport: true,
        };
        permissions.customers = {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canExport: true,
          canImport: true,
        };
        permissions.invoices = {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canExport: true,
          canImport: true,
        };
        permissions.branches = {
          canRead: true,
          canWrite: true,
          canDelete: true,
          canExport: true,
          canImport: true,
        };
        permissions.reports = {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canExport: true,
          canImport: false,
        };
        permissions.settings = {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.users = {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        break;

      case AccessLevelName.MANAGER:
        permissions.products = {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canExport: true,
          canImport: true,
        };
        permissions.inventory = {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canExport: true,
          canImport: true,
        };
        permissions.customers = {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canExport: true,
          canImport: true,
        };
        permissions.invoices = {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canExport: true,
          canImport: false,
        };
        permissions.branches = {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canExport: true,
          canImport: false,
        };
        permissions.reports = {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canExport: true,
          canImport: false,
        };
        permissions.settings = {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.users = {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        break;

      case AccessLevelName.EMPLOYEE:
        permissions.products = {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.inventory = {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.customers = {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.invoices = {
          canRead: true,
          canWrite: true,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.branches = {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.reports = {
          canRead: false,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.settings = {
          canRead: false,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.users = {
          canRead: false,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        break;

      case AccessLevelName.VIEWER:
        permissions.products = {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.inventory = {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.customers = {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.invoices = {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.branches = {
          canRead: true,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.reports = {
          canRead: false,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.settings = {
          canRead: false,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        permissions.users = {
          canRead: false,
          canWrite: false,
          canDelete: false,
          canExport: false,
          canImport: false,
        };
        break;

      default:
        // No permissions for unknown roles
        break;
    }

    return permissions;
  }

  // Helper methods
  get isOwner(): boolean {
    return this.name === AccessLevelName.OWNER;
  }

  get isAdmin(): boolean {
    return this.name === AccessLevelName.ADMIN;
  }

  get isManager(): boolean {
    return this.name === AccessLevelName.MANAGER;
  }

  get isEmployee(): boolean {
    return this.name === AccessLevelName.EMPLOYEE;
  }

  get isViewer(): boolean {
    return this.name === AccessLevelName.VIEWER;
  }

  get displayName(): string {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
}
