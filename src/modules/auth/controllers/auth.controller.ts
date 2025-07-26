import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../decorators/public.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CurrentUserId } from '../decorators/current-user-id.decorator';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { AuthResponseDto, AuthTokensDto } from '../dto/auth-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { User } from '../../users/entities/user.entity';
import { AUTH_SUCCESS } from '../../../constants/auth.constants';

interface ApiResponseWrapper<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Throttle({ short: { ttl: 3600000, limit: 3 } }) // 3 registrations per hour
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto,
  ): Promise<ApiResponseWrapper<AuthResponseDto>> {
    const result: AuthResponseDto =
      await this.authService.register(registerDto);
    return {
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      message: AUTH_SUCCESS.REGISTER_SUCCESS,
      data: result,
    };
  }

  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Throttle({ short: { ttl: 60000, limit: 5 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(
    @CurrentUser() user: User,
    @Body(ValidationPipe) loginDto: LoginDto,
  ): Promise<ApiResponseWrapper<AuthResponseDto>> {
    const result: AuthResponseDto = await this.authService.login(loginDto);
    return {
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      message: AUTH_SUCCESS.LOGIN_SUCCESS,
      data: result,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Throttle({ short: { ttl: 60000, limit: 5 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    type: AuthTokensDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  async refresh(
    @Body(ValidationPipe) refreshTokenDto: RefreshTokenDto,
  ): Promise<ApiResponseWrapper<AuthTokensDto>> {
    const result: AuthTokensDto = await this.authService.refreshToken(
      refreshTokenDto.refreshToken,
    );
    return {
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      message: AUTH_SUCCESS.TOKEN_REFRESHED,
      data: result,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logout successful',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async logout(
    @CurrentUserId() userId: string,
  ): Promise<ApiResponseWrapper<null>> {
    await this.authService.logout(userId);
    return {
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      message: AUTH_SUCCESS.LOGOUT_SUCCESS,
    };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logged out from all devices successfully',
  })
  async logoutAll(
    @CurrentUserId() userId: string,
  ): Promise<ApiResponseWrapper<null>> {
    await this.authService.logoutAllDevices(userId);
    return {
      success: true,
      message: 'Logged out from all devices successfully',
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Throttle({ medium: { ttl: 3600000, limit: 3 } }) // 3 password changes per hour
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Current password is incorrect',
  })
  async changePassword(
    @CurrentUserId() userId: string,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto,
  ): Promise<ApiResponseWrapper<null>> {
    await this.authService.changePassword(userId, changePasswordDto);
    return {
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      message: AUTH_SUCCESS.PASSWORD_CHANGED,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profile retrieved successfully',
    type: UserResponseDto,
  })
  async getProfile(
    @CurrentUserId() userId: string,
  ): Promise<ApiResponseWrapper<UserResponseDto>> {
    const user: UserResponseDto = await this.authService.getProfile(userId);
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User information retrieved successfully',
    type: UserResponseDto,
  })
  getCurrentUser(
    @CurrentUser() user: User,
  ): ApiResponseWrapper<UserResponseDto> {
    const userResponse: UserResponseDto = UserResponseDto.fromEntity(user);
    return {
      success: true,
      message: 'User information retrieved successfully',
      data: userResponse,
    };
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get authentication statistics (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Statistics retrieved successfully',
  })
  async getAuthStats(): Promise<ApiResponseWrapper<any>> {
    const stats = await this.authService.getAuthStats();
    return {
      success: true,
      message: 'Statistics retrieved successfully',
      data: stats,
    };
  }
}
