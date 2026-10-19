import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AuthRequest } from "@common/types/auth";

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<AuthRequest>().user,
);
