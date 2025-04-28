import { Module } from '@nestjs/common';
import { CompanyService } from './services/company.service';
import { CompanyController } from './controllers/company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from './entities/company.entity';
import { UserCompanyEntity } from '../user/entities/userCompany.entity';
import { UserService } from '../user/services/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyEntity, UserCompanyEntity])],
  providers: [CompanyService, UserService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
