import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../../../constants/auth.constants';

/**
 * Decorator to mark a route as public (no authentication required)
 * Usage: @Public()
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
