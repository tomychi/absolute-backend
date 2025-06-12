import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BranchService } from '../services/branch.service';
import { BranchCreateDTO } from '../dto/branch.dto';
import { BranchEntity } from '../entities/branch.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Branch')
@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Get(':companyId')
  async getBranchesByCompany(
    @Param('companyId') companyId: string,
  ): Promise<BranchEntity[]> {
    return this.branchService.getBranchesByCompany(companyId);
  }

  @Post()
  async createBranch(
    @Body() branchCreateDTO: BranchCreateDTO,
  ): Promise<BranchEntity> {
    return this.branchService.createBranch(branchCreateDTO);
  }
}
