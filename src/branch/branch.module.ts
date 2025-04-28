import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchService } from './services/branch.service';
import { BranchController } from './controllers/branch.controller';
import { BranchEntity } from './entities/branch.entity';
import { CompanyEntity } from '../company/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BranchEntity, CompanyEntity])],
  providers: [BranchService],
  controllers: [BranchController],
})
export class BranchModule {}
