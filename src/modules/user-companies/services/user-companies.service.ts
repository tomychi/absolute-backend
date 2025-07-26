import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  UserCompany,
  UserCompanyStatus,
} from '../entities/user-company.entity';
import { UserPermission, ModuleType } from '../entities/user-permission.entity';
import {
  AccessLevel,
  AccessLevelName,
} from '../../access-levels/entities/access-level.entity';
import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';
import { InviteUserDto } from '../dto/invite-user.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UserCompanyResponseDto } from '../dto/user-company-response.dto';
import { UserPermissionsResponseDto } from '../dto/user-permissions-response.dto';
import { CompanyMembersResponseDto } from '../dto/company-members-response.dto';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class UserCompaniesService {
  constructor(
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
    @InjectRepository(UserPermission)
    private readonly userPermissionRepository: Repository<UserPermission>,
    @InjectRepository(AccessLevel)
    private readonly accessLevelRepository: Repository<AccessLevel>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create owner relationship when user creates a company
   */
  async createOwnerRelationship(
    userId: string,
    companyId: string,
  ): Promise<UserCompanyResponseDto> {
    // Find owner access level
    const ownerLevel = await this.accessLevelRepository.findOne({
      where: { name: AccessLevelName.OWNER },
    });

    if (!ownerLevel) {
      throw new NotFoundException('Owner access level not found');
    }

    // Create owner relationship
    const userCompany = this.userCompanyRepository.create({
      userId,
      companyId,
      accessLevelId: ownerLevel.id,
      status: UserCompanyStatus.ACTIVE,
      joinedAt: new Date(),
    });

    const savedUserCompany = await this.userCompanyRepository.save(userCompany);

    // Create default permissions for owner
    await this.createDefaultPermissions(
      savedUserCompany.id,
      AccessLevelName.OWNER,
    );

    return this.findUserCompanyById(savedUserCompany.id);
  }

  /**
   * Invite user to company
   */
  async inviteUser(
    inviteDto: InviteUserDto,
    inviterId: string,
  ): Promise<UserCompanyResponseDto> {
    // Verify inviter has permission to invite users
    const inviterRelation = await this.findUserCompanyByUserAndCompany(
      inviterId,
      inviteDto.companyId,
    );
    if (!inviterRelation.canManageUsers) {
      throw new ForbiddenException(
        'You do not have permission to invite users',
      );
    }

    // Verify inviter cannot assign higher or equal role
    const accessLevel = await this.accessLevelRepository.findOneBy({
      id: inviteDto.accessLevelId,
    });
    if (!accessLevel) {
      throw new NotFoundException('Access level not found');
    }

    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      inviterRelation.accessLevel.hierarchyLevel <= accessLevel.hierarchyLevel
    ) {
      throw new ForbiddenException(
        'You cannot assign a role equal or higher than your own',
      );
    }

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(inviteDto.email);
    let userId: string;

    if (!existingUser) {
      // Create new user if doesn't exist
      const newUserDto = await this.usersService.create({
        email: inviteDto.email,
        firstName: inviteDto.firstName,
        lastName: inviteDto.lastName,
        password: this.generateTemporaryPassword(),
      });
      userId = newUserDto.id;
    } else {
      userId = existingUser.id;
    }

    // Check if user is already in company
    const existingRelation = await this.userCompanyRepository.findOne({
      where: { userId, companyId: inviteDto.companyId },
    });

    if (existingRelation) {
      throw new ConflictException('User is already a member of this company');
    }

    // Create pending relationship
    const userCompany = this.userCompanyRepository.create({
      userId,
      companyId: inviteDto.companyId,
      accessLevelId: inviteDto.accessLevelId,
      invitedBy: inviterId,
      status: UserCompanyStatus.PENDING,
    });

    const savedUserCompany = await this.userCompanyRepository.save(userCompany);

    // Create default permissions
    await this.createDefaultPermissions(savedUserCompany.id, accessLevel.name);

    // TODO: Send invitation email

    return this.findUserCompanyById(savedUserCompany.id);
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(
    userCompanyId: string,
    userId: string,
  ): Promise<UserCompanyResponseDto> {
    const userCompany = await this.userCompanyRepository.findOne({
      where: { id: userCompanyId, userId, status: UserCompanyStatus.PENDING },
    });

    if (!userCompany) {
      throw new NotFoundException('Invitation not found or already processed');
    }

    userCompany.acceptInvitation();
    await this.userCompanyRepository.save(userCompany);

    return this.findUserCompanyById(userCompanyId);
  }

  /**
   * Get user's companies
   */
  async getUserCompanies(userId: string): Promise<UserCompanyResponseDto[]> {
    const userCompanies = await this.userCompanyRepository.find({
      where: { userId, status: UserCompanyStatus.ACTIVE },
      relations: ['company', 'accessLevel'],
      order: { createdAt: 'DESC' },
    });

    return userCompanies.map((uc) => UserCompanyResponseDto.fromEntity(uc));
  }

  /**
   * Get company members
   */
  async getCompanyMembers(
    companyId: string,
    requesterId: string,
  ): Promise<CompanyMembersResponseDto> {
    // Verify requester has access to company
    await this.verifyUserCompanyAccess(requesterId, companyId);

    const company = await this.companyRepository.findOneBy({ id: companyId });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const userCompanies = await this.userCompanyRepository.find({
      where: {
        companyId,
        status: In([UserCompanyStatus.ACTIVE, UserCompanyStatus.PENDING]),
      },
      relations: ['user', 'accessLevel'],
      order: { createdAt: 'ASC' },
    });

    return CompanyMembersResponseDto.fromData(
      companyId,
      company.name,
      userCompanies,
    );
  }

  /**
   * Update user role in company
   */
  async updateUserRole(
    userCompanyId: string,
    updateDto: UpdateUserRoleDto,
    requesterId: string,
  ): Promise<UserCompanyResponseDto> {
    const userCompany = await this.userCompanyRepository.findOne({
      where: { id: userCompanyId },
      relations: ['accessLevel'],
    });

    if (!userCompany) {
      throw new NotFoundException('User-company relationship not found');
    }

    // Verify requester has permission to change roles
    const requesterRelation = await this.findUserCompanyByUserAndCompany(
      requesterId,
      userCompany.companyId,
    );
    if (!requesterRelation.canManageUsers) {
      throw new ForbiddenException(
        'You do not have permission to change user roles',
      );
    }

    // Verify requester can manage target user
    if (!requesterRelation.canManage(userCompany)) {
      throw new ForbiddenException('You cannot change the role of this user');
    }

    // Get new access level
    const newAccessLevel = await this.accessLevelRepository.findOneBy({
      id: updateDto.accessLevelId,
    });
    if (!newAccessLevel) {
      throw new NotFoundException('Access level not found');
    }

    // Verify requester cannot assign higher or equal role
    if (
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      requesterRelation.accessLevel.hierarchyLevel <=
      newAccessLevel.hierarchyLevel
    ) {
      throw new ForbiddenException(
        'You cannot assign a role equal or higher than your own',
      );
    }

    // Update role
    userCompany.accessLevelId = updateDto.accessLevelId;
    await this.userCompanyRepository.save(userCompany);

    // Update permissions
    await this.updateUserPermissions(userCompany.id, newAccessLevel.name);

    return this.findUserCompanyById(userCompanyId);
  }

  /**
   * Remove user from company
   */
  async removeUserFromCompany(
    userCompanyId: string,
    requesterId: string,
  ): Promise<void> {
    const userCompany = await this.userCompanyRepository.findOne({
      where: { id: userCompanyId },
      relations: ['accessLevel'],
    });

    if (!userCompany) {
      throw new NotFoundException('User-company relationship not found');
    }

    // Verify requester has permission
    const requesterRelation = await this.findUserCompanyByUserAndCompany(
      requesterId,
      userCompany.companyId,
    );
    if (!requesterRelation.canManageUsers) {
      throw new ForbiddenException(
        'You do not have permission to remove users',
      );
    }

    // Verify requester can manage target user
    if (!requesterRelation.canManage(userCompany)) {
      throw new ForbiddenException('You cannot remove this user');
    }

    // Cannot remove owner
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (userCompany.accessLevel.name === AccessLevelName.OWNER) {
      throw new ForbiddenException('Cannot remove company owner');
    }

    // Remove user
    userCompany.remove();
    await this.userCompanyRepository.save(userCompany);
  }

  /**
   * Get user permissions for company
   */
  async getUserPermissions(
    userId: string,
    companyId: string,
  ): Promise<UserPermissionsResponseDto> {
    const userCompany = await this.userCompanyRepository.findOne({
      where: { userId, companyId, status: UserCompanyStatus.ACTIVE },
      relations: ['accessLevel', 'permissions'],
    });

    if (!userCompany) {
      throw new NotFoundException('User is not a member of this company');
    }

    return UserPermissionsResponseDto.fromEntity(userCompany);
  }

  /**
   * Switch user's active company
   */
  async switchCompany(
    userId: string,
    companyId: string,
  ): Promise<UserCompanyResponseDto> {
    const userCompany = await this.findUserCompanyByUserAndCompany(
      userId,
      companyId,
    );

    // Update last activity
    userCompany.updateActivity();
    await this.userCompanyRepository.save(userCompany);

    return UserCompanyResponseDto.fromEntity(userCompany);
  }

  /**
   * Verify user has access to company
   */
  async verifyUserCompanyAccess(
    userId: string,
    companyId: string,
  ): Promise<UserCompany> {
    const userCompany = await this.userCompanyRepository.findOne({
      where: {
        userId,
        companyId,
        status: UserCompanyStatus.ACTIVE,
        isActiveField: true,
      },
      relations: ['accessLevel', 'permissions'],
    });

    if (!userCompany) {
      throw new ForbiddenException('You do not have access to this company');
    }

    return userCompany;
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(
    userId: string,
    companyId: string,
    module: ModuleType,
    action: 'read' | 'write' | 'delete' | 'export' | 'import',
  ): Promise<boolean> {
    try {
      const userCompany = await this.verifyUserCompanyAccess(userId, companyId);
      return userCompany.hasPermission(module, action);
    } catch {
      return false;
    }
  }

  /**
   * Get access levels
   */
  async getAccessLevels(): Promise<AccessLevel[]> {
    return this.accessLevelRepository.find({
      where: { isActive: true },
      order: { hierarchyLevel: 'DESC' },
    });
  }

  // Private helper methods

  private async findUserCompanyById(
    id: string,
  ): Promise<UserCompanyResponseDto> {
    const userCompany = await this.userCompanyRepository.findOne({
      where: { id },
      relations: ['user', 'company', 'accessLevel'],
    });

    if (!userCompany) {
      throw new NotFoundException('User-company relationship not found');
    }

    return UserCompanyResponseDto.fromEntity(userCompany);
  }

  private async findUserCompanyByUserAndCompany(
    userId: string,
    companyId: string,
  ): Promise<UserCompany> {
    const userCompany = await this.userCompanyRepository.findOne({
      where: { userId, companyId, status: UserCompanyStatus.ACTIVE },
      relations: ['accessLevel'],
    });

    if (!userCompany) {
      throw new NotFoundException('User-company relationship not found');
    }

    return userCompany;
  }

  private async createDefaultPermissions(
    userCompanyId: string,
    accessLevelName: AccessLevelName,
  ): Promise<void> {
    const modules = Object.values(ModuleType);
    const permissions: Partial<UserPermission>[] = [];

    for (const module of modules) {
      const permission = UserPermission.createDefaultPermission(
        userCompanyId,
        module,
        accessLevelName,
      );
      permissions.push(permission);
    }

    await this.userPermissionRepository.save(permissions as UserPermission[]);
  }

  private async updateUserPermissions(
    userCompanyId: string,
    accessLevelName: AccessLevelName,
  ): Promise<void> {
    // Remove existing permissions
    await this.userPermissionRepository.delete({ userCompanyId });

    // Create new permissions based on new role
    await this.createDefaultPermissions(userCompanyId, accessLevelName);
  }

  private generateTemporaryPassword(): string {
    // Generate a temporary password - in production, send password reset email instead
    return Math.random().toString(36).slice(-12) + '!A1';
  }
}
