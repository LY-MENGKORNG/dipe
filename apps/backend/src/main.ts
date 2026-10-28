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
import { join } from "node:path"

const app = await safeTry(
  NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    instrument: ObserveInstrument,
    /**
     * NOTE: Cross-Origin Resource Sharing (CORS) is an HTTP-header-based security mechanism
     * that allows web servers to specify which origins (domains, schemes, or ports) are permitted to access their resources.
     * It acts as a controlled relaxation of the browser's Same-Origin Policy (SOP),
     * enabling secure cross-origin requests while preventing malicious sites from reading sensitive data from other domains.
     */
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

// WARN: I doing this check is because it block the Scalar API endpoints!
if (env.NODE_ENV === "production") {
  /**
   * NOTE: Cross-Site Request Forgery (CSRF) is a web security vulnerability
   * that tricks an authenticated user into performing unintended actions on a trusted web application.
   * Attackers exploit the trust a site places in a user’s browser
   * by forcing the submission of forged HTTP requests that automatically include the victim’s session credentials.
   */
  app.enableCsrfProtection({ trustedOrigins: env.ALLOW_ORIGINS })
  app.useSecurityHeaders({})
}
app.useWebSocketAdapter(new WsAdapter(app))
app.setGlobalPrefix("/api")
app.useStaticAssets({ root: join(__dirname, "..", "public") })

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
