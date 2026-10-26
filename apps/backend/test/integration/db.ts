import { afterAll, beforeAll } from "bun:test"
import type { Provider, Type } from "@nestjs/common"
import { Test, type TestingModule } from "@nestjs/testing"
import { db } from "@config/db"
import { DBModule } from "@modules/db.module"

export const useDatabase = (providers: Provider[]) => {
  const ctx = {
    suffix: Date.now(),
    userIds: [] as number[],
    get: <T>(token: Type<T>) => ctx.module.get(token),
  } as {
    module: TestingModule
    suffix: number
    userIds: number[]
    get: <T>(token: Type<T>) => T
  }

  beforeAll(async () => {
    ctx.module = await Test.createTestingModule({
      imports: [DBModule],
      providers,
    }).compile()
  })

  afterAll(async () => {
    await db.workspace.deleteMany({ where: { ownerId: { in: ctx.userIds } } })
    await db.user.deleteMany({ where: { id: { in: ctx.userIds } } })
    await ctx.module.close()
  })

  return ctx
}
