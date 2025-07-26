import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig: JwtModuleOptions = {
  secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
};

export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

export const securityConfig = {
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
  rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL || '60'), // seconds
  rateLimitLimit: parseInt(process.env.RATE_LIMIT_LIMIT || '10'), // requests per TTL
};
