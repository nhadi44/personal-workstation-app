import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import type { RequestUser } from '../interfaces/request-user.interface';

const ROLE_PRIORITY: Record<Role, number> = {
  [Role.USER]: 1,
  [Role.ADMIN]: 2,
  [Role.SUPERADMIN]: 3,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as RequestUser | undefined;

    if (!user?.role) {
      throw new ForbiddenException('Missing role context');
    }

    const userPriority = ROLE_PRIORITY[user.role] ?? 0;
    const hasRole = requiredRoles.some(
      (requiredRole) => userPriority >= ROLE_PRIORITY[requiredRole],
    );

    if (!hasRole) {
      throw new ForbiddenException('Insufficient role privileges');
    }

    return true;
  }
}
