import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBranchDto } from './create-branch.dto';

export class UpdateBranchDto extends PartialType(
  OmitType(CreateBranchDto, ['code'] as const),
) {
  // All fields from CreateBranchDto except 'code' are optional for updates
  // Branch code should not be changed after creation
}
