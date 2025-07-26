import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../../../constants/auth.constants';

/**
 * Decorator to specify required roles for a route
 * Usage: @Roles('admin', 'manager')
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
