import { Global, Module } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtModule, type JwtModuleOptions } from "@nestjs/jwt"
import type { Env } from "@repo/env"
import { UsersModule } from "@modules/users/users.module"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { NotificationsModule } from "@modules/notifications/notifications.module"
import { GithubModule } from "@modules/github/github.module"

@Global()
@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): JwtModuleOptions => ({
        secret: config.get("JWT_SECRET", { infer: true }),
        signOptions: {
          expiresIn: config.get("JWT_EXPIRES_IN", {
            infer: true,
          }) as NonNullable<JwtModuleOptions["signOptions"]>["expiresIn"],
        },
      }),
    }),
    NotificationsModule,
    GithubModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule],
})
export class AuthModule {}
