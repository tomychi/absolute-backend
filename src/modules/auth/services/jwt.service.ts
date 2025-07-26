import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { jwtConstants } from '../../../config/jwt.config';
import { TokenType } from '../../../constants/auth.constants';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  tokenVersion?: number;
  type: TokenType;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

@Injectable()
export class JwtService {
  constructor(private readonly nestJwtService: NestJwtService) {}

  /**
   * Generate access token
   */
  generateAccessToken(userId: string, email: string): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      type: TokenType.ACCESS,
    };

    return this.nestJwtService.sign(payload, {
      secret: jwtConstants.secret,
      expiresIn: jwtConstants.expiresIn,
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(
    userId: string,
    email: string,
    tokenVersion: number,
  ): string {
    const payload: JwtPayload = {
      sub: userId,
      email,
      tokenVersion,
      type: TokenType.REFRESH,
    };

    return this.nestJwtService.sign(payload, {
      secret: jwtConstants.refreshSecret,
      expiresIn: jwtConstants.refreshExpiresIn,
    });
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokenPair(
    userId: string,
    email: string,
    tokenVersion: number,
  ): TokenPair {
    const accessToken = this.generateAccessToken(userId, email);
    const refreshToken = this.generateRefreshToken(userId, email, tokenVersion);

    // Calculate expiration time for access token
    const expiresAt = new Date();
    const expiresInMs = this.parseExpirationTime(jwtConstants.expiresIn);
    expiresAt.setTime(expiresAt.getTime() + expiresInMs);

    return {
      accessToken,
      refreshToken,
      expiresAt,
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JwtPayload {
    try {
      const payload: unknown = this.nestJwtService.verify(token, {
        secret: jwtConstants.secret,
      });

      const jwtPayload = payload as JwtPayload;

      if (jwtPayload.type !== TokenType.ACCESS) {
        throw new Error('Invalid token type');
      }

      return jwtPayload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JwtPayload {
    try {
      const payload: unknown = this.nestJwtService.verify(token, {
        secret: jwtConstants.refreshSecret,
      });

      const jwtPayload = payload as JwtPayload;

      if (jwtPayload.type !== TokenType.REFRESH) {
        throw new Error('Invalid token type');
      }

      return jwtPayload;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      const decoded: unknown = this.nestJwtService.decode(token);
      return decoded as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiration date
   */
  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return null;

      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse expiration time string to milliseconds
   */
  private parseExpirationTime(expiresIn: string): number {
    const units: { [key: string]: number } = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error('Invalid expiration time format');
    }

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Create authorization header
   */
  createAuthorizationHeader(token: string): string {
    return `Bearer ${token}`;
  }
}
