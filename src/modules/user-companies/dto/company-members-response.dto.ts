import { ApiProperty } from '@nestjs/swagger';
import { UserCompany } from '../entities/user-company.entity';

export class CompanyMemberDto {
  @ApiProperty({
    example: 'uuid-user-company-id',
    description: 'User-company relationship ID',
  })
  id: string;

  @ApiProperty({ example: 'uuid-user-id', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  userName: string;

  @ApiProperty({ example: 'john@company.com', description: 'User email' })
  userEmail: string;

  @ApiProperty({ example: 'manager', description: 'User role' })
  role: string;

  @ApiProperty({ example: 'active', description: 'Status in company' })
  status: string;

  @ApiProperty({
    example: '2024-07-25T01:00:00Z',
    description: 'When user joined',
  })
  joinedAt?: Date;

  @ApiProperty({
    example: '2024-07-25T02:00:00Z',
    description: 'Last activity',
  })
  lastActivity?: Date;

  @ApiProperty({ example: true, description: 'Whether user is active' })
  isActive: boolean;
}

export class CompanyMembersResponseDto {
  @ApiProperty({ example: 'uuid-company-id', description: 'Company ID' })
  companyId: string;

  @ApiProperty({ example: 'Tech Solutions Inc.', description: 'Company name' })
  companyName: string;

  @ApiProperty({ example: 5, description: 'Total number of members' })
  totalMembers: number;

  @ApiProperty({
    description: 'List of company members',
    type: [CompanyMemberDto],
  })
  members: CompanyMemberDto[];

  // Static method to transform data to DTO
  static fromData(
    companyId: string,
    companyName: string,
    userCompanies: UserCompany[],
  ): CompanyMembersResponseDto {
    return {
      companyId,
      companyName,
      totalMembers: userCompanies.length,
      members: userCompanies.map((uc: UserCompany) => ({
        id: uc.id,
        userId: uc.userId,
        userName:
          uc.user?.fullName ||
          `${uc.user?.firstName} ${uc.user?.lastName || ''}`.trim(),
        userEmail: uc.user?.email || '',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        role: uc.accessLevel?.name || 'unknown',
        status: uc.status,
        joinedAt: uc.joinedAt,
        lastActivity: uc.lastActivity,
        isActive: uc.isActiveField,
      })),
    };
  }
}
