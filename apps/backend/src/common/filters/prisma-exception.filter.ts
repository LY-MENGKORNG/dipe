import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { Prisma } from "@config/db/generated/client";

const statusByCode: Record<string, { status: number; message: string }> = {
  P2002: { status: HttpStatus.CONFLICT, message: "Resource already exists" },
  P2003: { status: HttpStatus.CONFLICT, message: "Resource is still referenced" },
  P2025: { status: HttpStatus.NOT_FOUND, message: "Resource not found" },
};

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const mapped = statusByCode[exception.code] ?? {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Database error",
    };

    void reply.status(mapped.status).send({
      statusCode: mapped.status,
      message: mapped.message,
      code: exception.code,
    });
  }
}
