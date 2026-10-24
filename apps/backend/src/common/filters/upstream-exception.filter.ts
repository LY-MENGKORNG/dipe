import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpStatus,
} from "@nestjs/common"
import type { FastifyReply } from "fastify"
import {
  HttpClientError,
  isHTTPError,
  isTimeoutError,
  SchemaValidationError,
} from "@repo/http"

@Catch(HttpClientError, SchemaValidationError)
export class UpstreamExceptionFilter implements ExceptionFilter {
  catch(
    exception: HttpClientError | SchemaValidationError,
    host: ArgumentsHost,
  ) {
    const reply = host.switchToHttp().getResponse<FastifyReply>()
    const upstream =
      isHTTPError(exception) || isTimeoutError(exception)
        ? exception.request.url
        : undefined

    if (
      isHTTPError(exception) &&
      exception.response.status === HttpStatus.NOT_FOUND
    ) {
      return void reply.status(HttpStatus.NOT_FOUND).send({
        statusCode: HttpStatus.NOT_FOUND,
        message: "Not found upstream",
      })
    }

    const status = isTimeoutError(exception)
      ? HttpStatus.GATEWAY_TIMEOUT
      : HttpStatus.BAD_GATEWAY
    void reply.status(status).send({
      statusCode: status,
      message:
        status === HttpStatus.GATEWAY_TIMEOUT
          ? "Upstream timed out"
          : "Upstream failure",
      error: exception.name,
      ...(upstream && { upstream: new URL(upstream).host }),
    })
  }
}
