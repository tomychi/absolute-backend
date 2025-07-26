import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  // Override handleRequest to not throw error if no token
  handleRequest(err: any, user: any) {
    // If there's an error or no user, just return null (don't throw)
    if (err || !user) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user;
  }

  canActivate(context: ExecutionContext) {
    // Always allow the request to continue, but try to authenticate if possible
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return super.canActivate(context);
  }
}
