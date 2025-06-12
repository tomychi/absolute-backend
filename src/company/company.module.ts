import { Module } from '@nestjs/common';
import { CompanyService } from './services/company.service';
import { CompanyController } from './controllers/company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyEntity } from './entities/company.entity';
import { UserCompanyEntity } from '../user/entities/userCompany.entity';
import { UserService } from '../user/services/user.service';
import { BranchModule } from '../branch/branch.module';
import { CustomerModule } from '../customer/customer.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyEntity, UserCompanyEntity]),
    BranchModule,
    UserModule,
    CustomerModule,
  ],
  providers: [CompanyService, UserService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
