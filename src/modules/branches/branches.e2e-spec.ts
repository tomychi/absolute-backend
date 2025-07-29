import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { Branch } from './entities/branch.entity';
import { UserCompany } from '../user-companies/entities/user-company.entity';
import { AccessLevel } from '../access-levels/entities/access-level.entity';
import { AppModule } from 'src/app.module';

describe('Branches (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;
  let branchRepository: Repository<Branch>;
  let userCompanyRepository: Repository<UserCompany>;
  let accessLevelRepository: Repository<AccessLevel>;
  let jwtService: JwtService;

  let testUser: User;
  let testCompany: Company;
  let accessToken: string;
  let ownerAccessLevel: AccessLevel;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get repositories
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    companyRepository = moduleFixture.get<Repository<Company>>(
      getRepositoryToken(Company),
    );
    branchRepository = moduleFixture.get<Repository<Branch>>(
      getRepositoryToken(Branch),
    );
    userCompanyRepository = moduleFixture.get<Repository<UserCompany>>(
      getRepositoryToken(UserCompany),
    );
    accessLevelRepository = moduleFixture.get<Repository<AccessLevel>>(
      getRepositoryToken(AccessLevel),
    );
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create test data
    await setupTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    await app.close();
  });

  describe('POST /companies/:companyId/branches', () => {
    it('should create a new branch successfully', async () => {
      const createBranchDto = {
        name: 'Tienda Centro',
        code: 'TC001',
        type: 'retail',
        address: '123 Main Street, City Center',
        phone: '+1-555-123-4567',
        email: 'centro@company.com',
        latitude: -34.6037,
        longitude: -58.3816,
        businessHours: {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '10:00', close: '16:00', closed: false },
          sunday: { open: '00:00', close: '00:00', closed: true },
        },
        isActive: true,
        isMain: true,
      };

      const response = await request(app.getHttpServer())
        .post(`/api/companies/${testCompany.id}/branches`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createBranchDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(createBranchDto.name);
      expect(response.body.data.code).toBe(createBranchDto.code);
      expect(response.body.data.type).toBe(createBranchDto.type);
      expect(response.body.data.isMain).toBe(true);
      expect(response.body.data.isActive).toBe(true);
    });

    it('should return 409 if branch code already exists', async () => {
      const createBranchDto = {
        name: 'Otra Tienda',
        code: 'TC001', // Same code as previous test
        type: 'retail',
      };

      await request(app.getHttpServer())
        .post(`/api/companies/${testCompany.id}/branches`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(createBranchDto)
        .expect(409);
    });

    it('should return 403 if user has no access to company', async () => {
      // Create another user without company access
      const otherUser = await userRepository.save({
        email: 'other@test.com',
        password: 'hashedpassword',
        firstName: 'Other',
        lastName: 'User',
      });

      const otherToken = jwtService.sign({
        sub: otherUser.id,
        email: otherUser.email,
      });

      const createBranchDto = {
        name: 'Unauthorized Branch',
        code: 'UB001',
        type: 'retail',
      };

      await request(app.getHttpServer())
        .post(`/api/companies/${testCompany.id}/branches`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(createBranchDto)
        .expect(403);

      // Cleanup
      await userRepository.delete(otherUser.id);
    });

    it('should validate required fields', async () => {
      const invalidBranchDto = {
        // Missing required fields
        type: 'retail',
      };

      await request(app.getHttpServer())
        .post(`/api/companies/${testCompany.id}/branches`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidBranchDto)
        .expect(400);
    });
  });

  describe('GET /companies/:companyId/branches', () => {
    it('should get all branches for company', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/companies/${testCompany.id}/branches`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.branches).toBeDefined();
      expect(Array.isArray(response.body.data.branches)).toBe(true);
      expect(response.body.data.total).toBeGreaterThan(0);
    });

    it('should filter branches by type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/companies/${testCompany.id}/branches?type=retail`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.branches.forEach((branch: any) => {
        expect(branch.type).toBe('retail');
      });
    });

    it('should search branches by name', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/companies/${testCompany.id}/branches?search=Centro`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.branches.length).toBeGreaterThan(0);
    });

    it('should paginate results', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/companies/${testCompany.id}/branches?page=1&limit=5`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(5);
      expect(response.body.data.totalPages).toBeDefined();
    });
  });

  describe('GET /branches/:id', () => {
    let branchId: string;

    beforeAll(async () => {
      // Get the branch we created in the first test
      const branch = await branchRepository.findOne({
        where: { companyId: testCompany.id, code: 'TC001' },
      });
      branchId = branch!.id;
    });

    it('should get branch by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/branches/${branchId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(branchId);
      expect(response.body.data.code).toBe('TC001');
    });

    it('should return 404 for non-existent branch', async () => {
      const fakeId = '00000000-0000-4000-8000-000000000000';

      await request(app.getHttpServer())
        .get(`/api/branches/${fakeId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(404);
    });
  });

  describe('PATCH /branches/:id', () => {
    let branchId: string;

    beforeAll(async () => {
      const branch = await branchRepository.findOne({
        where: { companyId: testCompany.id, code: 'TC001' },
      });
      branchId = branch!.id;
    });

    it('should update branch successfully', async () => {
      const updateBranchDto = {
        name: 'Tienda Centro Actualizada',
        address: '456 Updated Street',
        phone: '+1-555-999-8888',
      };

      const response = await request(app.getHttpServer())
        .patch(`/api/branches/${branchId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateBranchDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateBranchDto.name);
      expect(response.body.data.address).toBe(updateBranchDto.address);
      expect(response.body.data.phone).toBe(updateBranchDto.phone);
    });
  });

  describe('PATCH /branches/:id/toggle-status', () => {
    let branchId: string;

    beforeAll(async () => {
      // Create a secondary branch for testing status toggle
      const secondaryBranch = await branchRepository.save({
        name: 'Secondary Branch',
        code: 'SB001',
        type: 'warehouse',
        companyId: testCompany.id,
        isActive: true,
        isMain: false,
      });
      branchId = secondaryBranch.id;
    });

    it('should toggle branch status', async () => {
      // First toggle (deactivate)
      const response1 = await request(app.getHttpServer())
        .patch(`/api/branches/${branchId}/toggle-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response1.body.success).toBe(true);
      expect(response1.body.data.isActive).toBe(false);

      // Second toggle (reactivate)
      const response2 = await request(app.getHttpServer())
        .patch(`/api/branches/${branchId}/toggle-status`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response2.body.success).toBe(true);
      expect(response2.body.data.isActive).toBe(true);
    });
  });

  describe('GET /companies/:companyId/branches/stats', () => {
    it('should get branch statistics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/companies/${testCompany.id}/branches/stats`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalBranches).toBeDefined();
      expect(response.body.data.activeBranches).toBeDefined();
      expect(response.body.data.byType).toBeDefined();
      expect(typeof response.body.data.totalBranches).toBe('number');
    });
  });

  describe('GET /companies/:companyId/branches/summaries', () => {
    it('should get branch summaries', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/companies/${testCompany.id}/branches/summaries`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);

      if (response.body.data.length > 0) {
        const summary = response.body.data[0];
        expect(summary.id).toBeDefined();
        expect(summary.name).toBeDefined();
        expect(summary.code).toBeDefined();
        expect(summary.type).toBeDefined();
      }
    });
  });

  describe('GET /companies/:companyId/branches/generate-code', () => {
    it('should generate unique branch code', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/api/companies/${testCompany.id}/branches/generate-code?branchName=Nueva Sucursal`,
        )
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.suggestedCode).toBeDefined();
      expect(typeof response.body.data.suggestedCode).toBe('string');
    });
  });

  // Helper functions for test setup and cleanup
  async function setupTestData() {
    // Create access level
    ownerAccessLevel = await accessLevelRepository.save({
      name: 'owner',
      description: 'Company owner',
    });

    // Create test user
    testUser = await userRepository.save({
      email: 'test@branches.com',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
    });

    // Create test company
    testCompany = await companyRepository.save({
      name: 'Test Company',
      taxId: 'TC123456789',
      address: 'Test Address',
    });

    // Create user-company relationship
    await userCompanyRepository.save({
      userId: testUser.id,
      companyId: testCompany.id,
      accessLevelId: ownerAccessLevel.id,
    });

    // Generate access token
    accessToken = jwtService.sign({
      sub: testUser.id,
      email: testUser.email,
    });
  }

  async function cleanupTestData() {
    // Delete in reverse order of dependencies
    await branchRepository.delete({ companyId: testCompany.id });
    await userCompanyRepository.delete({ userId: testUser.id });
    await companyRepository.delete(testCompany.id);
    await userRepository.delete(testUser.id);
    await accessLevelRepository.delete(ownerAccessLevel.id);
  }
});
