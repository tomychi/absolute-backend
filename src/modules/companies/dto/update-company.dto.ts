import { PartialType } from '@nestjs/swagger';
import { CreateCompanyDto } from './create-company.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  // This class extends CreateCompanyDto and makes all its properties optional
  // No additional properties are needed unless specific fields need to be modified
}
