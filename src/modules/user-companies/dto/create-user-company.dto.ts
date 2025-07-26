import { IsUUID, IsInt, IsOptional, IsEnum, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserCompanyStatus } from '../entities/user-company.entity';

export class CreateUserCompanyDto {
  @ApiProperty({
    example: 'uuid-user-id',
    description: 'User ID to add to company',
  })
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  userId: string;

  @ApiProperty({
    example: 'uuid-company-id',
    description: 'Company ID',
  })
  @IsUUID(4, { message: 'Company ID must be a valid UUID' })
  companyId: string;

  @ApiProperty({
    example: 3,
    description:
      'Access level ID (1=viewer, 2=employee, 3=manager, 4=admin, 5=owner)',
  })
  @IsInt({ message: 'Access level ID must be an integer' })
  @Min(1, { message: 'Access level ID must be at least 1' })
  accessLevelId: number;

  @ApiPropertyOptional({
    example: 'pending',
    description: 'Initial status for the user',
    enum: UserCompanyStatus,
  })
  @IsOptional()
  @IsEnum(UserCompanyStatus, {
    message: 'Status must be a valid UserCompanyStatus',
  })
  status?: UserCompanyStatus;
}
