import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Roles } from "@common/decorators";
import type { AuthRequest } from "@common/types/auth";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride(Roles, [ctx.getHandler(), ctx.getClass()]);
    if (!roles?.length) return true;

    const { user } = ctx.switchToHttp().getRequest<AuthRequest>();
    if (!user || !roles.includes(user.role)) throw new ForbiddenException("Insufficient role");
    return true;
  }
}
