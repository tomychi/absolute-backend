import { Module } from '@nestjs/common';
import { CompaniesService } from './services/companies.service';
import { CompaniesController } from './controllers/companies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { UserCompaniesModule } from '../user-companies/user-companies.module';
@Module({
  imports: [TypeOrmModule.forFeature([Company]), UserCompaniesModule],
  providers: [CompaniesService],
  controllers: [CompaniesController],
  exports: [CompaniesService, TypeOrmModule],
})
export class CompaniesModule {}
