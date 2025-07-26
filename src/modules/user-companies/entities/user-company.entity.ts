import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { IsBoolean, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';
import { AccessLevel } from '../../access-levels/entities/access-level.entity';
import { UserPermission, ModuleType } from './user-permission.entity';

export enum UserCompanyStatus {
  PENDING = 'pending', // Invited but not accepted yet
  ACTIVE = 'active', // Active member
  SUSPENDED = 'suspended', // Temporarily suspended
  INACTIVE = 'inactive', // Left or removed
}

@Entity('user_companies')
@Unique(['userId', 'companyId'])
@Index(['companyId', 'status'])
@Index(['userId', 'status'])
export class UserCompany {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId: string;

  @Column({ name: 'company_id' })
  @IsUUID(4, { message: 'Company ID must be a valid UUID' })
  companyId: string;

  @Column({ name: 'access_level_id' })
  accessLevelId: number;

  @Column({ name: 'invited_by', nullable: true })
  @IsOptional()
  @IsUUID(4, { message: 'Invited by must be a valid UUID' })
  invitedBy?: string;

  @Column({
    type: 'enum',
    enum: UserCompanyStatus,
    default: UserCompanyStatus.ACTIVE,
  })
  @IsEnum(UserCompanyStatus, {
    message: 'Status must be a valid UserCompanyStatus',
  })
  status: UserCompanyStatus;

  @Column({ name: 'is_active', default: true })
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActiveField: boolean;

  @Column({ name: 'joined_at', nullable: true })
  @IsOptional()
  joinedAt?: Date;

  @Column({ name: 'last_activity', nullable: true })
  @IsOptional()
  lastActivity?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  @ManyToOne(() => AccessLevel)
  @JoinColumn({ name: 'access_level_id' })
  accessLevel: AccessLevel;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invited_by' })
  inviter?: User;

  @OneToMany(
    () => UserPermission,
    (userPermission) => userPermission.userCompany,
    {
      cascade: true,
      eager: false,
    },
  )
  permissions: UserPermission[];

  // Helper methods
  get isOwner(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.accessLevel?.name === 'owner';
  }

  get isAdmin(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.accessLevel?.name === 'admin';
  }

  get isManager(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return this.accessLevel?.name === 'manager';
  }

  get canManageUsers(): boolean {
    return this.isOwner || this.isAdmin;
  }

  get canManageSettings(): boolean {
    return this.isOwner || this.isAdmin;
  }

  get isActive(): boolean {
    return this.status === UserCompanyStatus.ACTIVE && this.isActiveField;
  }

  get isPending(): boolean {
    return this.status === UserCompanyStatus.PENDING;
  }

  get isSuspended(): boolean {
    return this.status === UserCompanyStatus.SUSPENDED;
  }

  // Method to check if user can manage another user
  canManage(targetUserCompany: UserCompany): boolean {
    if (!this.isActive || !targetUserCompany.isActive) {
      return false;
    }

    // Can't manage yourself
    if (this.userId === targetUserCompany.userId) {
      return false;
    }

    // Must be in the same company
    if (this.companyId !== targetUserCompany.companyId) {
      return false;
    }

    // Check hierarchy
    return (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.accessLevel.hierarchyLevel >
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      targetUserCompany.accessLevel.hierarchyLevel
    );
  }

  // Method to activate pending invitation
  acceptInvitation(): void {
    if (this.status === UserCompanyStatus.PENDING) {
      this.status = UserCompanyStatus.ACTIVE;
      this.joinedAt = new Date();
    }
  }

  // Method to suspend user
  suspend(): void {
    if (this.status === UserCompanyStatus.ACTIVE) {
      this.status = UserCompanyStatus.SUSPENDED;
    }
  }

  // Method to reactivate suspended user
  reactivate(): void {
    if (this.status === UserCompanyStatus.SUSPENDED) {
      this.status = UserCompanyStatus.ACTIVE;
    }
  }

  // Method to remove user from company
  remove(): void {
    this.status = UserCompanyStatus.INACTIVE;
    this.isActiveField = false;
  }

  // Method to update last activity
  updateActivity(): void {
    this.lastActivity = new Date();
  }

  // Method to get permissions for a specific module
  getModulePermissions(module: ModuleType): UserPermission | undefined {
    return this.permissions?.find((permission) => permission.module === module);
  }

  // Method to check if user has specific permission
  hasPermission(
    module: ModuleType,
    action: 'read' | 'write' | 'delete' | 'export' | 'import',
  ): boolean {
    const modulePermission = this.getModulePermissions(module);
    if (!modulePermission) {
      return false;
    }

    switch (action) {
      case 'read':
        return modulePermission.canRead;
      case 'write':
        return modulePermission.canWrite;
      case 'delete':
        return modulePermission.canDelete;
      case 'export':
        return modulePermission.canExport;
      case 'import':
        return modulePermission.canImport;
      default:
        return false;
    }
  }

  // Method to get summary info
  getSummary() {
    return {
      id: this.id,
      userId: this.userId,
      companyId: this.companyId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      role: this.accessLevel?.name,
      status: this.status,
      isActive: this.isActiveField,
      joinedAt: this.joinedAt,
      lastActivity: this.lastActivity,
    };
  }
}
