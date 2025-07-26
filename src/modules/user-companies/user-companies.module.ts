import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCompaniesService } from './services/user-companies.service';
import { UserCompaniesController } from './controllers/user-companies.controller';
import { UserCompany } from './entities/user-company.entity';
import { UserPermission } from './entities/user-permission.entity';
import { AccessLevel } from '../access-levels/entities/access-level.entity';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { UsersModule } from '../users/users.module';
import { AccessLevelsModule } from '../access-levels/access-levels.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserCompany,
      UserPermission,
      AccessLevel,
      User,
      Company,
    ]),
    AccessLevelsModule,
    UsersModule,
  ],
  providers: [UserCompaniesService] as const,
  controllers: [UserCompaniesController],
  exports: [UserCompaniesService, TypeOrmModule] as const,
})
export class UserCompaniesModule {}
