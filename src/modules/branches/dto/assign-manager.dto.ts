import { IsUUID, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AssignManagerDto {
  @ApiPropertyOptional({
    example: 'uuid-manager-id',
    description: 'Manager user ID (null to remove manager)',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Manager ID must be a valid UUID' })
  managerId?: string | null;
}
