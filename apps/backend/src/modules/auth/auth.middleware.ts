import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  use(req: FastifyRequest["raw"], res: FastifyReply["raw"], next: () => void) {
    const startedAt = Date.now();

    // `finish` fires once the response has been handed to the socket, which is
    // the only point where the status code is final.
    res.once("finish", () => {
      const { method, url } = req;
      const message = `${method} ${url} ${res.statusCode} ${Date.now() - startedAt}ms`;

      if (res.statusCode >= 500) this.logger.error(message);
      else if (res.statusCode >= 400) this.logger.warn(message);
      else this.logger.debug(message);
    });

    next();
  }
}
