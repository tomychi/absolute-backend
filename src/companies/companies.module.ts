import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesController } from './controllers/companies.controller';
import { CompaniesEntity } from './entities/companies.entity';
import { CompaniesService } from './services/companies.service';

@Module({
  imports: [TypeOrmModule.forFeature([CompaniesEntity])],
  providers: [CompaniesService],
  controllers: [CompaniesController],
})
export class CompaniesModule {}
