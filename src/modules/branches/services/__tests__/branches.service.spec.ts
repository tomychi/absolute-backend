import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { BranchesService } from '../branches.service';
import { Branch, BranchType } from '../../entities/branch.entity';
import { Company } from '../../../companies/entities/company.entity';
import { User } from '../../../users/entities/user.entity';
import { UserCompany } from '../../../user-companies/entities/user-company.entity';

describe('BranchesService', () => {
  let service: BranchesService;
  let branchRepository: Repository<Branch>;
  let companyRepository: Repository<Company>;
  let userRepository: Repository<User>;
  let userCompanyRepository: Repository<UserCompany>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BranchesService,
        {
          provide: getRepositoryToken(Branch),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Company),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(UserCompany),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BranchesService>(BranchesService);
    branchRepository = module.get<Repository<Branch>>(
      getRepositoryToken(Branch),
    );
    companyRepository = module.get<Repository<Company>>(
      getRepositoryToken(Company),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userCompanyRepository = module.get<Repository<UserCompany>>(
      getRepositoryToken(UserCompany),
    );

    // Reset mocks
    jest.clearAllMocks();
    mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const mockCompany = {
      id: 'company-id',
      name: 'Test Company',
      isActive: true,
    };

    const mockUserCompany = {
      id: 'user-company-id',
      userId: 'user-id',
      companyId: 'company-id',
      accessLevel: { name: 'owner' },
      isActive: true,
    };

    const createBranchDto = {
      name: 'Test Branch',
      code: 'TB001',
      type: BranchType.RETAIL,
      address: 'Test Address',
      isActive: true,
      isMain: true,
    };

    beforeEach(() => {
      jest
        .spyOn(userCompanyRepository, 'findOne')
        .mockResolvedValue(mockUserCompany as any);
      jest
        .spyOn(companyRepository, 'findOne')
        .mockResolvedValue(mockCompany as any);
      jest.spyOn(branchRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(branchRepository, 'count').mockResolvedValue(0);
    });

    it('should create a branch successfully', async () => {
      const mockBranch = {
        id: 'branch-id',
        ...createBranchDto,
        companyId: 'company-id',
        displayName: 'Test Branch (TB001)',
        typeDisplayName: 'Retail Store',
        isCurrentlyOpen: () => true,
      };

      jest.spyOn(branchRepository, 'create').mockReturnValue(mockBranch as any);
      jest.spyOn(branchRepository, 'save').mockResolvedValue(mockBranch as any);

      // Mock findById call
      jest.spyOn(service, 'findById').mockResolvedValue({
        id: mockBranch.id,
        name: mockBranch.name,
        code: mockBranch.code,
        type: mockBranch.type,
        typeDisplayName: mockBranch.typeDisplayName,
        isActive: mockBranch.isActive,
        isMain: mockBranch.isMain,
        displayName: mockBranch.displayName,
        isCurrentlyOpen: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await service.create(
        'company-id',
        createBranchDto,
        'user-id',
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(createBranchDto.name);
      expect(result.code).toBe(createBranchDto.code);
      expect(branchRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createBranchDto,
          companyId: 'company-id',
        }),
      );
      expect(branchRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if branch code already exists', async () => {
      const existingBranch = { id: 'existing-branch', code: 'TB001' };
      jest
        .spyOn(branchRepository, 'findOne')
        .mockResolvedValue(existingBranch as any);

      await expect(
        service.create('company-id', createBranchDto, 'user-id'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if company not found', async () => {
      jest.spyOn(companyRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.create('company-id', createBranchDto, 'user-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user has no access', async () => {
      jest.spyOn(userCompanyRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.create('company-id', createBranchDto, 'user-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findByCompany', () => {
    const mockBranches = [
      {
        id: 'branch-1',
        name: 'Branch 1',
        code: 'B001',
        type: BranchType.RETAIL,
        isActive: true,
        displayName: 'Branch 1 (B001)',
        typeDisplayName: 'Retail Store',
        isCurrentlyOpen: () => true,
      },
      {
        id: 'branch-2',
        name: 'Branch 2',
        code: 'B002',
        type: BranchType.WAREHOUSE,
        isActive: true,
        displayName: 'Branch 2 (B002)',
        typeDisplayName: 'Warehouse',
        isCurrentlyOpen: () => false,
      },
    ];

    const mockUserCompany = {
      userId: 'user-id',
      companyId: 'company-id',
      accessLevel: { name: 'admin' },
      isActive: true,
    };

    beforeEach(() => {
      jest
        .spyOn(userCompanyRepository, 'findOne')
        .mockResolvedValue(mockUserCompany as any);
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockBranches, 2]);
    });

    it('should return paginated branches', async () => {
      const searchDto = {
        page: 1,
        limit: 10,
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'DESC' as const,
      };

      const result = await service.findByCompany(
        'company-id',
        searchDto,
        'user-id',
      );

      expect(result).toBeDefined();
      expect(result.branches).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should apply search filter', async () => {
      const searchDto = {
        page: 1,
        limit: 10,
        search: 'Branch 1',
        sortBy: 'name',
        sortOrder: 'ASC' as const,
      };

      await service.findByCompany('company-id', searchDto, 'user-id');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('LOWER(branch.name) LIKE LOWER(:search)'),
        expect.objectContaining({ search: '%Branch 1%' }),
      );
    });

    it('should apply type filter', async () => {
      const searchDto = {
        page: 1,
        limit: 10,
        type: BranchType.RETAIL,
        sortBy: 'createdAt',
        sortOrder: 'DESC' as const,
      };

      await service.findByCompany('company-id', searchDto, 'user-id');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'branch.type = :type',
        { type: BranchType.RETAIL },
      );
    });
  });

  describe('findById', () => {
    const mockBranch = {
      id: 'branch-id',
      name: 'Test Branch',
      code: 'TB001',
      type: BranchType.RETAIL,
      companyId: 'company-id',
      isActive: true,
      isMain: false,
      displayName: 'Test Branch (TB001)',
      typeDisplayName: 'Retail Store',
      isCurrentlyOpen: () => true,
      manager: null,
      company: { id: 'company-id', name: 'Test Company' },
    };

    it('should return branch by id', async () => {
      jest
        .spyOn(branchRepository, 'findOne')
        .mockResolvedValue(mockBranch as any);
      jest.spyOn(userCompanyRepository, 'findOne').mockResolvedValue({
        userId: 'user-id',
        companyId: 'company-id',
        isActive: true,
      } as any);

      const result = await service.findById('branch-id', 'user-id');

      expect(result).toBeDefined();
      expect(result.id).toBe('branch-id');
      expect(result.name).toBe('Test Branch');
    });

    it('should throw NotFoundException if branch not found', async () => {
      jest.spyOn(branchRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleStatus', () => {
    const mockBranch = {
      id: 'branch-id',
      name: 'Test Branch',
      companyId: 'company-id',
      isActive: true,
      isMain: false,
    };

    const mockUserCompany = {
      userId: 'user-id',
      companyId: 'company-id',
      accessLevel: { name: 'admin' },
      isActive: true,
    };

    beforeEach(() => {
      jest
        .spyOn(branchRepository, 'findOne')
        .mockResolvedValue(mockBranch as any);
      jest
        .spyOn(userCompanyRepository, 'findOne')
        .mockResolvedValue(mockUserCompany as any);
      jest.spyOn(branchRepository, 'save').mockResolvedValue(mockBranch as any);
      jest.spyOn(service, 'findById').mockResolvedValue({
        id: mockBranch.id,
        isActive: !mockBranch.isActive,
      } as any);
    });

    it('should toggle branch status', async () => {
      const result = await service.toggleStatus('branch-id', 'user-id');

      expect(branchRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false, // toggled from true
        }),
      );
      expect(result).toBeDefined();
    });
  });

  describe('generateCodeSuggestion', () => {
    const mockCompany = {
      id: 'company-id',
      name: 'Test Company',
    };

    const mockUserCompany = {
      userId: 'user-id',
      companyId: 'company-id',
      isActive: true,
    };

    beforeEach(() => {
      jest
        .spyOn(userCompanyRepository, 'findOne')
        .mockResolvedValue(mockUserCompany as any);
      jest
        .spyOn(companyRepository, 'findOne')
        .mockResolvedValue(mockCompany as any);
      jest.spyOn(branchRepository, 'count').mockResolvedValue(0);
    });

    it('should generate unique branch code', async () => {
      const result = await service.generateCodeSuggestion(
        'company-id',
        'New Branch',
        'user-id',
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should increment code if already exists', async () => {
      jest
        .spyOn(branchRepository, 'count')
        .mockResolvedValueOnce(1) // First call returns 1 (exists)
        .mockResolvedValueOnce(0); // Second call returns 0 (doesn't exist)

      const result = await service.generateCodeSuggestion(
        'company-id',
        'New Branch',
        'user-id',
      );

      expect(result).toBeDefined();
      expect(branchRepository.count).toHaveBeenCalledTimes(2);
    });
  });
});
