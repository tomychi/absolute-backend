import { Module } from '@nestjs/common';
import { BranchesService } from './services/branches.service';
import { BranchesController } from './controllers/branches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Branch } from './entities/branch.entity';
import { Company } from '../companies/entities/company.entity';
import { User } from '../users/entities/user.entity';
import { UserCompany } from '../user-companies/entities/user-company.entity';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { UserCompaniesModule } from '../user-companies/user-companies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Branch, Company, User, UserCompany]),
    UsersModule,
    CompaniesModule,
    UserCompaniesModule,
  ],

  providers: [BranchesService],
  controllers: [BranchesController],
  exports: [BranchesService, TypeOrmModule],
})
export class BranchesModule {}
