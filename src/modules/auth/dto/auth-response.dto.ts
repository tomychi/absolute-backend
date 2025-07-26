import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthTokensDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token',
  })
  refreshToken: string;

  @ApiProperty({
    example: '2024-07-24T23:30:00Z',
    description: 'Access token expiration time',
  })
  expiresAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Authentication tokens',
    type: AuthTokensDto,
  })
  tokens: AuthTokensDto;
}

export class ProfileResponseDto extends UserResponseDto {
  @ApiProperty({
    example: '2024-07-24T22:14:43.418Z',
    description: 'Last login timestamp',
  })
  lastLogin?: Date;
}
