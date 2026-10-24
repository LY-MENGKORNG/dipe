import { NestFactory } from "@nestjs/core"
import { AppModule } from "./modules/app.module"
import { env } from "@repo/env"
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify"
import { isError, safeTry } from "@repo/utils"
import { apiReference } from "@config/docs.config"
import { requestMethods } from "@repo/http"
import { ObserveInstrument } from "@modules/observe.module"
import { WsAdapter } from "@nestjs/platform-ws"
import { type FastifyRequest } from "fastify"

const app = await safeTry(
  NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    instrument: ObserveInstrument,
    cors: { origin: env.ALLOW_ORIGINS, methods: requestMethods as string[] },
    snapshot: true,
  }),
)

if (isError(app)) {
  console.error("Unable to factorizing the application", app.message)
  process.exit(1)
}

// Enabling & register services
app.enableShutdownHooks()
if (env.NODE_ENV === "production") {
  app.enableCsrfProtection({ trustedOrigins: env.ALLOW_ORIGINS })
  app.useSecurityHeaders()
}
app.useWebSocketAdapter(new WsAdapter(app))
app.setGlobalPrefix("/api")

const scalaReference = apiReference(app)
app
  .getHttpAdapter()
  .getInstance()
  .get("/docs", (request, reply) => {
    reply.hijack()
    scalaReference(request as FastifyRequest, reply.raw)
  })

const server = await safeTry(app.listen(env.PORT, "0.0.0.0"))

if (isError(server)) {
  console.error("Fails to start the applicaion", server.message)
  process.exit(1)
}
