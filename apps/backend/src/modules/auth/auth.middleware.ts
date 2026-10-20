import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name)

  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    this.logger.debug(req.headers.from, req.method)
    next();
  }
}
