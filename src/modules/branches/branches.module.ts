import { Module } from '@nestjs/common';
import { BranchesService } from './services/branches.service';
import { BranchesController } from './controllers/branches.controller';

@Module({
  providers: [BranchesService],
  controllers: [BranchesController],
})
export class BranchesModule {}
