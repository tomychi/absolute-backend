import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({
    example: 3,
    description:
      'New access level ID (1=viewer, 2=employee, 3=manager, 4=admin, 5=owner)',
  })
  @IsInt({ message: 'Access level ID must be an integer' })
  @Min(1, { message: 'Access level ID must be at least 1' })
  accessLevelId: number;
}
