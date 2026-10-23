import { ArgumentsHost, Catch, Logger } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import type { FastifyRequest } from "fastify";
import { ZodSerializationException } from "nestjs-zod";

@Catch(ZodSerializationException)
export class SerializationExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(SerializationExceptionFilter.name);

  catch(exception: ZodSerializationException, host: ArgumentsHost): void {
    const request = host.switchToHttp().getRequest<FastifyRequest>();
    const zodError = exception.getZodError();
    const issues =
      zodError && typeof zodError === "object" && "issues" in zodError ? zodError.issues : zodError;

    this.logger.error(
      `Response for ${request.method} ${request.url} does not match its schema: ${JSON.stringify(issues)}`,
      exception.stack,
    );

    super.catch(exception, host);
  }
}
