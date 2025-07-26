import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SwitchCompanyDto {
  @ApiProperty({
    example: 'uuid-company-id',
    description: 'Company ID to switch to',
  })
  @IsUUID(4, { message: 'Company ID must be a valid UUID' })
  companyId: string;
}
