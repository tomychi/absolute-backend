import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Branch, BranchType } from '../entities/branch.entity';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';
import {
  UserCompany,
  UserCompanyStatus,
} from '../../user-companies/entities/user-company.entity';
import { CreateBranchDto } from '../dto/create-branch.dto';
import { UpdateBranchDto } from '../dto/update-branch.dto';
import { BranchSearchDto } from '../dto/branch-search.dto';
import { BranchResponseDto } from '../dto/branch-response.dto';
import { BranchSummaryDto } from '../dto/branch-summary.dto';
import { AssignManagerDto } from '../dto/assign-manager.dto';

export interface PaginatedBranchesResponse {
  branches: BranchResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BranchStatsResponse {
  totalBranches: number;
  activeBranches: number;
  inactiveBranches: number;
  byType: Record<BranchType, number>;
  branchesWithManager: number;
  branchesWithoutManager: number;
}

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserCompany)
    private readonly userCompanyRepository: Repository<UserCompany>,
  ) {}

  /**
   * Create a new branch for a company
   */
  async create(
    companyId: string,
    createBranchDto: CreateBranchDto,
    userId: string,
  ): Promise<BranchResponseDto> {
    // Verify user has permission to create branches in this company
    await this.validateUserCompanyAccess(userId, companyId, ['owner', 'admin']);

    // Verify company exists
    const company = await this.companyRepository.findOne({
      where: { id: companyId, isActive: true },
    });

    if (!company) {
      throw new NotFoundException('Company not found or inactive');
    }

    // Check if branch code already exists in this company
    const existingBranch = await this.branchRepository.findOne({
      where: {
        companyId,
        code: createBranchDto.code,
      },
    });

    if (existingBranch) {
      throw new ConflictException(
        `Branch code '${createBranchDto.code}' already exists in this company`,
      );
    }

    // Validate manager if provided
    if (createBranchDto.managerId) {
      await this.validateManager(createBranchDto.managerId, companyId);
    }

    // Handle main branch logic
    if (createBranchDto.isMain) {
      await this.unsetCurrentMainBranch(companyId);
    } else {
      // If this is the first branch, make it main by default
      const branchCount = await this.branchRepository.count({
        where: { companyId },
      });

      if (branchCount === 0) {
        createBranchDto.isMain = true;
      }
    }

    // Set default business hours if not provided
    const businessHours =
      createBranchDto.businessHours || Branch.getDefaultBusinessHours();

    // Create branch
    const branch = this.branchRepository.create({
      ...createBranchDto,
      companyId,
      businessHours,
      isActive: createBranchDto.isActive ?? true,
    });

    const savedBranch = await this.branchRepository.save(branch);

    // Load relations for response
    return this.findById(savedBranch.id);
  }

  /**
   * Find all branches for a company with search and pagination
   */
  async findByCompany(
    companyId: string,
    searchDto: BranchSearchDto,
    userId: string,
  ): Promise<PaginatedBranchesResponse> {
    // Verify user has access to this company
    await this.validateUserCompanyAccess(userId, companyId);

    const {
      page = 1,
      limit = 10,
      search,
      type,
      isActive,
      isMain,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = searchDto;

    const query = this.branchRepository
      .createQueryBuilder('branch')
      .leftJoinAndSelect('branch.manager', 'manager')
      .leftJoinAndSelect('branch.company', 'company')
      .where('branch.companyId = :companyId', { companyId });

    // Apply filters
    if (search) {
      query.andWhere(
        '(LOWER(branch.name) LIKE LOWER(:search) OR LOWER(branch.code) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (type) {
      query.andWhere('branch.type = :type', { type });
    }

    if (typeof isActive === 'boolean') {
      query.andWhere('branch.isActive = :isActive', { isActive });
    }

    if (typeof isMain === 'boolean') {
      query.andWhere('branch.isMain = :isMain', { isMain });
    }

    // Apply sorting
    const allowedSortFields = [
      'name',
      'code',
      'type',
      'createdAt',
      'updatedAt',
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    query.orderBy(`branch.${sortField}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    const [branches, total] = await query.getManyAndCount();

    return {
      branches: branches.map((branch) => BranchResponseDto.fromEntity(branch)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find branch by ID
   */
  async findById(
    branchId: string,
    userId?: string,
  ): Promise<BranchResponseDto> {
    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
      relations: ['manager', 'company'],
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // If userId provided, validate access
    if (userId) {
      await this.validateUserCompanyAccess(userId, branch.companyId);
    }

    return BranchResponseDto.fromEntity(branch);
  }

  /**
   * Update branch
   */
  async update(
    branchId: string,
    updateBranchDto: UpdateBranchDto,
    userId: string,
  ): Promise<BranchResponseDto> {
    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
      relations: ['company'],
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(userId, branch.companyId, [
      'owner',
      'admin',
    ]);

    // Validate manager if being changed
    if (updateBranchDto.managerId) {
      await this.validateManager(updateBranchDto.managerId, branch.companyId);
    }

    // Handle main branch logic
    if (updateBranchDto.isMain && !branch.isMain) {
      await this.unsetCurrentMainBranch(branch.companyId);
    }

    // Update branch
    Object.assign(branch, updateBranchDto);
    await this.branchRepository.save(branch);

    return this.findById(branchId);
  }

  /**
   * Toggle branch active status
   */
  async toggleStatus(
    branchId: string,
    userId: string,
  ): Promise<BranchResponseDto> {
    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(userId, branch.companyId, [
      'owner',
      'admin',
    ]);

    // Prevent deactivating the main branch if it's the only active branch
    if (branch.isMain && branch.isActive) {
      const activeBranchCount = await this.branchRepository.count({
        where: {
          companyId: branch.companyId,
          isActive: true,
        },
      });

      if (activeBranchCount === 1) {
        throw new BadRequestException(
          'Cannot deactivate the main branch when it is the only active branch',
        );
      }
    }

    branch.isActive = !branch.isActive;
    await this.branchRepository.save(branch);

    return this.findById(branchId);
  }

  /**
   * Soft delete branch
   */
  async remove(branchId: string, userId: string): Promise<void> {
    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(userId, branch.companyId, ['owner']);

    // Prevent deletion of main branch if there are other branches
    if (branch.isMain) {
      const branchCount = await this.branchRepository.count({
        where: { companyId: branch.companyId },
      });

      if (branchCount > 1) {
        throw new BadRequestException(
          'Cannot delete the main branch while other branches exist. Transfer main status first.',
        );
      }
    }

    // TODO: Check for related data (inventory, invoices, etc.)
    // This should be implemented when those modules are created

    await this.branchRepository.softDelete(branchId);
  }

  /**
   * Assign or remove manager from branch
   */
  async assignManager(
    branchId: string,
    assignManagerDto: AssignManagerDto,
    userId: string,
  ): Promise<BranchResponseDto> {
    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
    });

    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(userId, branch.companyId, [
      'owner',
      'admin',
    ]);

    // Validate new manager if provided
    if (assignManagerDto.managerId) {
      await this.validateManager(assignManagerDto.managerId, branch.companyId);
    }

    branch.managerId = assignManagerDto.managerId;
    await this.branchRepository.save(branch);

    return this.findById(branchId);
  }

  /**
   * Get branch statistics for a company
   */
  async getCompanyBranchStats(
    companyId: string,
    userId: string,
  ): Promise<BranchStatsResponse> {
    // Verify user has access
    await this.validateUserCompanyAccess(userId, companyId);

    const branches = await this.branchRepository.find({
      where: { companyId },
      relations: ['manager'],
    });

    const stats: BranchStatsResponse = {
      totalBranches: branches.length,
      activeBranches: branches.filter((b) => b.isActive).length,
      inactiveBranches: branches.filter((b) => !b.isActive).length,
      byType: {
        [BranchType.RETAIL]: 0,
        [BranchType.WAREHOUSE]: 0,
        [BranchType.OFFICE]: 0,
        [BranchType.VIRTUAL]: 0,
        [BranchType.DISTRIBUTION]: 0,
      },
      branchesWithManager: branches.filter((b) => b.managerId).length,
      branchesWithoutManager: branches.filter((b) => !b.managerId).length,
    };

    // Count by type
    branches.forEach((branch) => {
      stats.byType[branch.type]++;
    });

    return stats;
  }

  /**
   * Get branch summaries for dropdown/selection
   */
  async getBranchSummaries(
    companyId: string,
    userId: string,
    activeOnly: boolean = true,
  ): Promise<BranchSummaryDto[]> {
    // Verify user has access
    await this.validateUserCompanyAccess(userId, companyId);

    const whereCondition: FindOptionsWhere<Branch> = { companyId };
    if (activeOnly) {
      whereCondition.isActive = true;
    }

    const branches = await this.branchRepository.find({
      where: whereCondition,
      relations: ['manager'],
      order: { isMain: 'DESC', name: 'ASC' },
    });

    return branches.map((branch) => BranchSummaryDto.fromEntity(branch));
  }

  /**
   * Get main branch for a company
   */
  async getMainBranch(
    companyId: string,
    userId?: string,
  ): Promise<BranchResponseDto> {
    if (userId) {
      await this.validateUserCompanyAccess(userId, companyId);
    }

    const mainBranch = await this.branchRepository.findOne({
      where: { companyId, isMain: true },
      relations: ['manager', 'company'],
    });

    if (!mainBranch) {
      throw new NotFoundException('Main branch not found for this company');
    }

    return BranchResponseDto.fromEntity(mainBranch);
  }

  /**
   * Transfer main branch status
   */
  async transferMainStatus(
    fromBranchId: string,
    toBranchId: string,
    userId: string,
  ): Promise<{ from: BranchResponseDto; to: BranchResponseDto }> {
    const [fromBranch, toBranch] = await Promise.all([
      this.branchRepository.findOne({ where: { id: fromBranchId } }),
      this.branchRepository.findOne({ where: { id: toBranchId } }),
    ]);

    if (!fromBranch || !toBranch) {
      throw new NotFoundException('One or both branches not found');
    }

    if (fromBranch.companyId !== toBranch.companyId) {
      throw new BadRequestException('Branches must belong to the same company');
    }

    // Verify user has permission
    await this.validateUserCompanyAccess(userId, fromBranch.companyId, [
      'owner',
    ]);

    if (!fromBranch.isMain) {
      throw new BadRequestException('Source branch is not the main branch');
    }

    if (!toBranch.isActive) {
      throw new BadRequestException('Target branch must be active');
    }

    // Transfer main status
    fromBranch.isMain = false;
    toBranch.isMain = true;

    await Promise.all([
      this.branchRepository.save(fromBranch),
      this.branchRepository.save(toBranch),
    ]);

    return {
      from: await this.findById(fromBranchId),
      to: await this.findById(toBranchId),
    };
  }

  /**
   * Generate unique branch code suggestion
   */
  async generateCodeSuggestion(
    companyId: string,
    branchName: string,
    userId: string,
  ): Promise<string> {
    // Verify user has access
    await this.validateUserCompanyAccess(userId, companyId);

    const company = await this.companyRepository.findOne({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    let suggestion = Branch.generateCodeSuggestion(company.name, branchName);
    let counter = 1;

    // Ensure uniqueness
    while (await this.isCodeExists(companyId, suggestion)) {
      const companyCode = company.name.substring(0, 2).toUpperCase();
      const branchCode = branchName.substring(0, 3).toUpperCase();
      suggestion = `${companyCode}${branchCode}${counter.toString().padStart(2, '0')}`;
      counter++;
    }

    return suggestion;
  }

  // Private helper methods

  /**
   * Validate user has access to company with specific roles
   */
  private async validateUserCompanyAccess(
    userId: string,
    companyId: string,
    requiredRoles?: string[],
  ): Promise<UserCompany> {
    const userCompany = await this.userCompanyRepository.findOne({
      where: {
        userId,
        companyId,
        isActiveField: true,
        status: UserCompanyStatus.ACTIVE,
      },
      relations: ['accessLevel'],
    });

    if (!userCompany) {
      throw new ForbiddenException('Access denied to this company');
    }

    if (
      requiredRoles &&
      !requiredRoles.includes(userCompany.accessLevel.name)
    ) {
      throw new ForbiddenException(
        `Required role: ${requiredRoles.join(' or ')}`,
      );
    }

    return userCompany;
  }

  /**
   * Validate manager exists and has access to company
   */
  private async validateManager(
    managerId: string,
    companyId: string,
  ): Promise<void> {
    const manager = await this.userRepository.findOne({
      where: { id: managerId, isActive: true },
    });

    if (!manager) {
      throw new NotFoundException('Manager not found or inactive');
    }

    // Check if manager has access to this company
    const managerCompany = await this.userCompanyRepository.findOne({
      where: {
        userId: managerId,
        companyId,
        isActive: true,
      },
    });

    if (!managerCompany) {
      throw new BadRequestException(
        'Manager does not have access to this company',
      );
    }
  }

  /**
   * Unset current main branch for company
   */
  private async unsetCurrentMainBranch(companyId: string): Promise<void> {
    await this.branchRepository.update(
      { companyId, isMain: true },
      { isMain: false },
    );
  }

  /**
   * Check if branch code exists in company
   */
  private async isCodeExists(
    companyId: string,
    code: string,
  ): Promise<boolean> {
    const count = await this.branchRepository.count({
      where: { companyId, code },
    });
    return count > 0;
  }
}
