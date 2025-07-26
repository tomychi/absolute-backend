import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { jwtConfig } from '../../config/jwt.config';
import { UsersModule } from '../users/users.module';

// Services
import { JwtService as CustomJwtService } from './services/jwt.service';
import { AuthService } from './services/auth.service';

// Controllers
import { AuthController } from './controllers/auth.controller';

// Strategies
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

// Guards
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { OptionalJwtGuard } from './guards/optional-jwt.guard';

@Module({
  imports: [
    // Import UsersModule to access UsersService
    UsersModule,

    // Configure PassportModule
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),

    // Configure JwtModule
    JwtModule.register(jwtConfig),
  ] as const,

  providers: [
    // Services
    AuthService,
    CustomJwtService,

    // Strategies
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,

    // Guards
    LocalAuthGuard,
    JwtAuthGuard,
    JwtRefreshGuard,
    OptionalJwtGuard,
  ] as const,

  controllers: [AuthController],

  exports: [
    // Export services for use in other modules
    AuthService,
    CustomJwtService,

    // Export guards for use in other modules
    JwtAuthGuard,
    LocalAuthGuard,
    JwtRefreshGuard,
    OptionalJwtGuard,
  ] as const,
})
export class AuthModule {}
