import { INestApplication } from "@nestjs/common"
import type { ServerResponse } from "node:http"
import type { FastifyRequest } from "fastify"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { apiReference as reference } from "@scalar/nestjs-api-reference"
import { cleanupOpenApiDoc } from "nestjs-zod"
import pkg from "../../package.json" with { type: "json" }

export type FastifyHandler = (req: FastifyRequest, res: ServerResponse) => void

const config = new DocumentBuilder()
  .setTitle("DIPE API Documentation")
  .setDescription(pkg.description)
  .setVersion(pkg.version)
  .addTag("dipe")
  .addBearerAuth(
    { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    "bearer",
  )
  .addSecurityRequirements("bearer")
  .build()

export function apiReference<T>(app: INestApplication<T>) {
  return reference({
    content: () => cleanupOpenApiDoc(SwaggerModule.createDocument(app, config)),
    theme: "saturn",
    layout: "modern",
    withFastify: true,
  }) as FastifyHandler
}
