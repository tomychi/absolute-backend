import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessLevel, AccessLevelName } from '../entities/access-level.entity';

@Injectable()
export class AccessLevelsService {
  constructor(
    @InjectRepository(AccessLevel)
    private readonly accessLevelRepository: Repository<AccessLevel>,
  ) {}

  /**
   * Get all access levels
   */
  async findAll(): Promise<AccessLevel[]> {
    return this.accessLevelRepository.find({
      where: { isActive: true },
      order: { hierarchyLevel: 'DESC' },
    });
  }

  /**
   * Get access level by ID
   */
  async findOne(id: number): Promise<AccessLevel> {
    const accessLevel = await this.accessLevelRepository.findOneBy({ id });

    if (!accessLevel) {
      throw new NotFoundException('Access level not found');
    }

    return accessLevel;
  }

  /**
   * Get access level by name
   */
  async findByName(name: AccessLevelName): Promise<AccessLevel> {
    const accessLevel = await this.accessLevelRepository.findOne({
      where: { name, isActive: true },
    });

    if (!accessLevel) {
      throw new NotFoundException(`Access level '${name}' not found`);
    }

    return accessLevel;
  }

  /**
   * Get permissions for access level
   */
  async getPermissions(id: number): Promise<Record<string, any>> {
    const accessLevel = await this.findOne(id);
    return accessLevel.getDefaultPermissions();
  }

  /**
   * Get access levels that user can assign (lower than user's level)
   */
  async getAssignableAccessLevels(
    userHierarchyLevel: number,
  ): Promise<AccessLevel[]> {
    return this.accessLevelRepository
      .find({
        where: { isActive: true },
        order: { hierarchyLevel: 'DESC' },
      })
      .then((levels) =>
        levels.filter((level) => level.hierarchyLevel < userHierarchyLevel),
      );
  }

  /**
   * Initialize default access levels (for seeding)
   */
  async initializeDefaultAccessLevels(): Promise<void> {
    const existingLevels = await this.accessLevelRepository.count();

    if (existingLevels > 0) {
      return; // Already initialized
    }

    const defaultLevels = [
      {
        name: AccessLevelName.OWNER,
        description:
          'Company owner with full control over all aspects of the business',
        hierarchyLevel: 5,
        isActive: true,
      },
      {
        name: AccessLevelName.ADMIN,
        description:
          'Administrator with broad permissions across most business functions',
        hierarchyLevel: 4,
        isActive: true,
      },
      {
        name: AccessLevelName.MANAGER,
        description:
          'Manager with permissions for daily operations and team management',
        hierarchyLevel: 3,
        isActive: true,
      },
      {
        name: AccessLevelName.EMPLOYEE,
        description:
          'Employee with permissions for assigned tasks and basic operations',
        hierarchyLevel: 2,
        isActive: true,
      },
      {
        name: AccessLevelName.VIEWER,
        description: 'Read-only access to basic business information',
        hierarchyLevel: 1,
        isActive: true,
      },
    ];

    await this.accessLevelRepository.save(defaultLevels);
  }

  /**
   * Check if level can manage another level
   */
  async canManageLevel(
    managerLevelId: number,
    targetLevelId: number,
  ): Promise<boolean> {
    const [managerLevel, targetLevel] = await Promise.all([
      this.findOne(managerLevelId),
      this.findOne(targetLevelId),
    ]);

    return managerLevel.canManage(targetLevel);
  }
}
