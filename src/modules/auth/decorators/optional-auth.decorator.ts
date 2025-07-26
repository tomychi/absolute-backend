import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { OptionalJwtGuard } from '../guards/optional-jwt.guard';

/**
 * Decorator for optional authentication (user may or may not be logged in)
 * Usage: @OptionalAuth()
 */
export const OptionalAuth = () => {
  return applyDecorators(UseGuards(OptionalJwtGuard), ApiBearerAuth());
};
