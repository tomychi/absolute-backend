import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid-here', description: 'User ID' })
  id: string;

  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  email: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  firstName: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'User last name' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890', description: 'User phone' })
  phone?: string;

  @ApiProperty({ example: true, description: 'Whether user is active' })
  isActive: boolean;

  @ApiProperty({ example: false, description: 'Whether email is verified' })
  emailVerified: boolean;

  @ApiPropertyOptional({
    example: '2024-01-01T00:00:00Z',
    description: 'Last login date',
  })
  lastLogin?: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Last update date',
  })
  updatedAt: Date;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  fullName: string;

  // Static method to properly transform User entity to DTO
  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      fullName: `${user.firstName} ${user.lastName || ''}`.trim(),
    };
  }
}
