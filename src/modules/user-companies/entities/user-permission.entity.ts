import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { IsBoolean, IsUUID, IsEnum } from 'class-validator';
import { UserCompany } from './user-company.entity';

export enum ModuleType {
  PRODUCTS = 'products',
  INVENTORY = 'inventory',
  CUSTOMERS = 'customers',
  INVOICES = 'invoices',
  BRANCHES = 'branches',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  USERS = 'users',
}

export interface PermissionActions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canExport: boolean;
  canImport: boolean;
}

@Entity('user_permissions')
@Unique(['userCompanyId', 'module'])
@Index(['userCompanyId'])
export class UserPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_company_id' })
  @IsUUID(4, { message: 'User company ID must be a valid UUID' })
  userCompanyId: string;

  @Column({ type: 'enum', enum: ModuleType })
  @IsEnum(ModuleType, { message: 'Module must be a valid ModuleType' })
  module: ModuleType;

  @Column({ name: 'can_read', default: true })
  @IsBoolean({ message: 'Can read must be a boolean' })
  canRead: boolean;

  @Column({ name: 'can_write', default: false })
  @IsBoolean({ message: 'Can write must be a boolean' })
  canWrite: boolean;

  @Column({ name: 'can_delete', default: false })
  @IsBoolean({ message: 'Can delete must be a boolean' })
  canDelete: boolean;

  @Column({ name: 'can_export', default: false })
  @IsBoolean({ message: 'Can export must be a boolean' })
  canExport: boolean;

  @Column({ name: 'can_import', default: false })
  @IsBoolean({ message: 'Can import must be a boolean' })
  canImport: boolean;

  // Relations
  @ManyToOne(() => UserCompany, (userCompany) => userCompany.permissions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_company_id' })
  userCompany: UserCompany;

  // Helper methods
  hasPermission(action: keyof PermissionActions): boolean {
    switch (action) {
      case 'canRead':
        return this.canRead;
      case 'canWrite':
        return this.canWrite;
      case 'canDelete':
        return this.canDelete;
      case 'canExport':
        return this.canExport;
      case 'canImport':
        return this.canImport;
      default:
        return false;
    }
  }

  // Method to get all permissions as object
  getAllPermissions(): PermissionActions {
    return {
      canRead: this.canRead,
      canWrite: this.canWrite,
      canDelete: this.canDelete,
      canExport: this.canExport,
      canImport: this.canImport,
    };
  }

  // Method to update permissions
  updatePermissions(permissions: Partial<PermissionActions>): void {
    if (permissions.canRead !== undefined) this.canRead = permissions.canRead;
    if (permissions.canWrite !== undefined)
      this.canWrite = permissions.canWrite;
    if (permissions.canDelete !== undefined)
      this.canDelete = permissions.canDelete;
    if (permissions.canExport !== undefined)
      this.canExport = permissions.canExport;
    if (permissions.canImport !== undefined)
      this.canImport = permissions.canImport;
  }

  // Method to grant all permissions
  grantAllPermissions(): void {
    this.canRead = true;
    this.canWrite = true;
    this.canDelete = true;
    this.canExport = true;
    this.canImport = true;
  }

  // Method to revoke all permissions (except read)
  revokeAllPermissions(): void {
    this.canRead = true; // Always keep read access
    this.canWrite = false;
    this.canDelete = false;
    this.canExport = false;
    this.canImport = false;
  }

  // Method to check if has any write permission
  hasAnyWritePermission(): boolean {
    return this.canWrite || this.canDelete || this.canImport;
  }

  // Method to check if has full access to module
  hasFullAccess(): boolean {
    return (
      this.canRead &&
      this.canWrite &&
      this.canDelete &&
      this.canExport &&
      this.canImport
    );
  }

  // Method to check if is read-only
  isReadOnly(): boolean {
    return (
      this.canRead &&
      !this.canWrite &&
      !this.canDelete &&
      !this.canExport &&
      !this.canImport
    );
  }

  // Static method to create default permissions for a module and access level
  static createDefaultPermission(
    userCompanyId: string,
    module: ModuleType,
    accessLevelName: string,
  ): Partial<UserPermission> {
    const permission: Partial<UserPermission> = {
      userCompanyId,
      module,
      canRead: true, // Default to read access
      canWrite: false,
      canDelete: false,
      canExport: false,
      canImport: false,
    };

    // Set permissions based on access level
    switch (accessLevelName.toLowerCase()) {
      case 'owner':
        permission.canRead = true;
        permission.canWrite = true;
        permission.canDelete = true;
        permission.canExport = true;
        permission.canImport = true;
        break;

      case 'admin':
        permission.canRead = true;
        permission.canWrite = true;
        permission.canDelete = module !== ModuleType.SETTINGS;
        permission.canExport = true;
        permission.canImport =
          module !== ModuleType.USERS && module !== ModuleType.SETTINGS;
        break;

      case 'manager':
        permission.canRead = true;
        permission.canWrite = ![
          ModuleType.SETTINGS,
          ModuleType.USERS,
          ModuleType.BRANCHES,
        ].includes(module);
        permission.canDelete = false;
        permission.canExport =
          module !== ModuleType.SETTINGS && module !== ModuleType.USERS;
        permission.canImport = [
          ModuleType.PRODUCTS,
          ModuleType.INVENTORY,
          ModuleType.CUSTOMERS,
        ].includes(module);
        break;

      case 'employee':
        permission.canRead = ![
          ModuleType.REPORTS,
          ModuleType.SETTINGS,
          ModuleType.USERS,
        ].includes(module);
        permission.canWrite = [
          ModuleType.INVENTORY,
          ModuleType.CUSTOMERS,
          ModuleType.INVOICES,
        ].includes(module);
        permission.canDelete = false;
        permission.canExport = false;
        permission.canImport = false;
        break;

      case 'viewer':
        permission.canRead = ![
          ModuleType.REPORTS,
          ModuleType.SETTINGS,
          ModuleType.USERS,
        ].includes(module);
        permission.canWrite = false;
        permission.canDelete = false;
        permission.canExport = false;
        permission.canImport = false;
        break;

      default:
        // Minimal permissions for unknown roles
        permission.canRead = true;
        break;
    }

    return permission;
  }

  // Method to get permission level as string
  getPermissionLevel(): string {
    if (this.hasFullAccess()) return 'full';
    if (this.hasAnyWritePermission()) return 'write';
    if (this.canRead) return 'read';
    return 'none';
  }

  // Method to compare with another permission
  isHigherThan(otherPermission: UserPermission): boolean {
    const thisLevel = this.getPermissionLevelValue();
    const otherLevel = otherPermission.getPermissionLevelValue();
    return thisLevel > otherLevel;
  }

  private getPermissionLevelValue(): number {
    if (this.hasFullAccess()) return 4;
    if (this.hasAnyWritePermission()) return 3;
    if (this.canRead) return 2;
    return 1;
  }
}
