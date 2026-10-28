import {
  Global,
  Inject,
  Module,
  type OnApplicationShutdown,
} from "@nestjs/common"
import { Redis } from "ioredis"
import { env } from "@repo/env"
import { REDIS } from "@common/constants"
import { safeTry } from "@repo/utils"

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: () => new Redis(env.REDIS_URL, { lazyConnect: true }),
    },
  ],
  exports: [REDIS],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onApplicationShutdown() {
    await safeTry(() => this.redis.quit())
  }
}
