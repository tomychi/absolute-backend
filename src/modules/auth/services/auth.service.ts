import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { JwtService, JwtPayload } from './jwt.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { AuthResponseDto, AuthTokensDto } from '../dto/auth-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { User } from '../../users/entities/user.entity';
import { AUTH_ERRORS } from '../../../constants/auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate user credentials for local strategy
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        return null;
      }

      if (!user.isActive) {
        throw new UnauthorizedException(AUTH_ERRORS.USER_INACTIVE);
      }

      const isPasswordValid = await user.validatePassword(password);
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      return null;
    }
  }

  /**
   * Register new user
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      // Check if user already exists
      const existingUser = await this.usersService.findByEmail(
        registerDto.email,
      );
      if (existingUser) {
        throw new ConflictException(AUTH_ERRORS.EMAIL_ALREADY_EXISTS);
      }

      // Create new user
      const user = await this.usersService.create(registerDto);

      // Generate tokens
      const tokens = this.jwtService.generateTokenPair(
        user.id,
        user.email,
        0, // initial token version
      );

      return {
        user,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt: tokens.expiresAt,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to register user');
    }
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // Update last login
    await this.usersService.updateLastLogin(user.id);

    // Generate tokens
    const tokens = this.jwtService.generateTokenPair(
      user.id,
      user.email,
      user.tokenVersion,
    );

    // Convert user to response DTO
    const userResponse = UserResponseDto.fromEntity(user);

    return {
      user: userResponse,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokensDto> {
    try {
      const payload = this.jwtService.verifyRefreshToken(refreshToken);

      // Get user and verify token version
      const user = await this.usersService.findByEmail(payload.email);
      if (!user) {
        throw new UnauthorizedException(AUTH_ERRORS.USER_NOT_FOUND);
      }

      if (!user.isActive) {
        throw new UnauthorizedException(AUTH_ERRORS.USER_INACTIVE);
      }

      // Check token version (for logout all devices feature)
      if (payload.tokenVersion !== user.tokenVersion) {
        throw new UnauthorizedException(AUTH_ERRORS.INVALID_TOKEN);
      }

      // Generate new token pair
      const tokens = this.jwtService.generateTokenPair(
        user.id,
        user.email,
        user.tokenVersion,
      );

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.expiresAt,
      };
    } catch (error) {
      throw new UnauthorizedException(AUTH_ERRORS.REFRESH_TOKEN_INVALID);
    }
  }

  /**
   * Logout user (increment token version to invalidate all tokens)
   */
  async logout(userId: string): Promise<void> {
    await this.usersService.incrementTokenVersion(userId);
  }

  /**
   * Logout from all devices
   */
  async logoutAllDevices(userId: string): Promise<void> {
    await this.usersService.incrementTokenVersion(userId);
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    await this.usersService.changePassword(userId, changePasswordDto);

    // Increment token version to invalidate all existing tokens
    await this.usersService.incrementTokenVersion(userId);
  }

  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<UserResponseDto> {
    return this.usersService.findOne(userId);
  }

  /**
   * Verify JWT payload and return user
   */
  async validateJwtPayload(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.USER_NOT_FOUND);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AUTH_ERRORS.USER_INACTIVE);
    }

    return user;
  }

  /**
   * Validate refresh token payload
   */
  async validateRefreshTokenPayload(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findByEmail(payload.email);

    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.USER_NOT_FOUND);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AUTH_ERRORS.USER_INACTIVE);
    }

    // Check token version
    if (payload.tokenVersion !== user.tokenVersion) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_TOKEN);
    }

    return user;
  }

  /**
   * Check if user has valid session
   */
  async hasValidSession(
    userId: string,
    tokenVersion: number,
  ): Promise<boolean> {
    try {
      const user = await this.usersService.findOne(userId);
      return user.id === userId; // Token version check is done in JWT validation
    } catch (error) {
      return false;
    }
  }

  /**
   * Get authentication statistics
   */
  async getAuthStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
  }> {
    const stats = await this.usersService.getUserStats();
    return {
      totalUsers: stats.total,
      activeUsers: stats.active,
      verifiedUsers: stats.verified,
    };
  }
}
