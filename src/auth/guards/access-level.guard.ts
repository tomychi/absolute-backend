import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import {
  ACCESS_LEVEL_KEY,
  ADMIN_KEY,
  PUBLIC_KEY,
  ROLES_KEY,
} from 'src/constants/key.decorators';
import { ACCESS_LEVEL, ROLES } from 'src/constants/roles';
import { UserService } from '../../user/services/user.service';

@Injectable()
export class AccessLevelGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(
      PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    const roles = this.reflector.get<Array<keyof typeof ROLES>>(
      ROLES_KEY,
      context.getHandler(),
    );

    const accessLevel = this.reflector.get<keyof typeof ACCESS_LEVEL>(
      ACCESS_LEVEL_KEY,
      context.getHandler(),
    );

    const admin = this.reflector.get<string>(ADMIN_KEY, context.getHandler());

    const req = context.switchToHttp().getRequest<Request>();

    const { roleUser, idUser } = req;

    if (accessLevel === undefined) {
      if (roles === undefined) {
        if (!admin) {
          return true;
        } else if (admin && roleUser === admin) {
          return true;
        } else {
          throw new UnauthorizedException(
            'No tienes permisos para esta operacion',
          );
        }
      }
    }

    if (roleUser === ROLES.ADMIN) {
      return true;
    }

    const user = await this.userService.findUserById(idUser);

    const userExistInCompany = user.companyIncludes.find(
      (company) => company.company.id === req.params.companyId,
    );

    if (userExistInCompany === undefined) {
      throw new UnauthorizedException('No perteneces a la empresa');
    }

    // DEVELOPER = 30,
    // MANTEINER = 40,
    // OWNER = 50,
    if (ACCESS_LEVEL[accessLevel] > userExistInCompany.accessLevel) {
      throw new UnauthorizedException('No tenes permisos suficientes');
    }

    return true;
  }
}
