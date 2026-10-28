import { BullModule } from "@nestjs/bullmq"
import { join } from "node:path"
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core"
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler"
import { MailerModule } from "@nestjs-modules/mailer"
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter"
import { ZodValidationPipe, ZodSerializerInterceptor } from "nestjs-zod"
import { env, envSchema } from "@repo/env"
import { AuthGuard, RolesGuard } from "@common/guards"
import {
  SerializationExceptionFilter,
  PrismaExceptionFilter,
  UpstreamExceptionFilter,
} from "@common/filters"
import { AuthModule } from "@modules/auth/auth.module"
import { DBModule } from "@modules/db.module"
import { RedisModule } from "@modules/redis.module"
import { GithubModule } from "@modules/github/github.module"
import { NotificationsModule } from "@modules/notifications/notifications.module"
import { ObserveModule } from "@modules/observe.module"
import { UsersModule } from "./users/users.module"
import { AuthMiddleware } from "./auth/auth.middleware"
import { AuthController } from "./auth/auth.controller"
import { WorkspacesModule } from "./workspaces/workspaces.module"
import { ProjectsModule } from "./projects/projects.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: (raw) => {
        const result = envSchema.safeParse(raw)

        if (result.success) {
          return result.data
        }
        throw result.error
      },
    }),
    ObserveModule.forRoot({
      appKey: env.OBSERVE_APP_KEY,
      appSecret: env.OBSERVE_APP_SECRET,
      serviceId: "dipe",
    }),
    MailerModule.forRoot({
      transport: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        ignoreTLS: !env.SMTP_USER,
        ...(env.SMTP_USER && {
          auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
        }),
      },
      defaults: { from: env.MAIL_FROM },
      template: {
        dir: join(import.meta.dir, "notifications", "templates"),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
    BullModule.forRoot({
      connection: { url: env.REDIS_URL },
      prefix: env.NODE_ENV === "test" ? "bull-test" : "bull",
    }),
    ThrottlerModule.forRoot([{ name: "default", ttl: 60_000, limit: 100 }]),

    DBModule,
    RedisModule,
    UsersModule,
    AuthModule,
    GithubModule,
    NotificationsModule,
    WorkspacesModule,
    ProjectsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // applies it globally.
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
    { provide: APP_FILTER, useClass: UpstreamExceptionFilter },
    { provide: APP_FILTER, useClass: SerializationExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(AuthController)
  }
}
