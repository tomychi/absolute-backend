// Metadata keys for decorators
export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';

// JWT token types
export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

// Authentication errors
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_INACTIVE: 'User account is inactive',
  EMAIL_NOT_VERIFIED: 'Email not verified',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_EXPIRED: 'Token has expired',
  REFRESH_TOKEN_INVALID: 'Invalid refresh token',
  PASSWORD_MISMATCH: 'Current password is incorrect',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Insufficient permissions',
} as const;

// Success messages
export const AUTH_SUCCESS = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'User registered successfully',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_CHANGED: 'Password changed successfully',
  TOKEN_REFRESHED: 'Token refreshed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
} as const;

// Rate limiting
export const RATE_LIMITS = {
  AUTH: {
    TTL: 60, // 1 minute
    LIMIT: 5, // 5 attempts per minute
  },
  REGISTER: {
    TTL: 3600, // 1 hour
    LIMIT: 3, // 3 registrations per hour per IP
  },
  PASSWORD_RESET: {
    TTL: 3600, // 1 hour
    LIMIT: 3, // 3 password reset attempts per hour
  },
} as const;
