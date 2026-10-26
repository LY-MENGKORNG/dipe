import { afterAll, beforeAll, mock } from "bun:test"
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify"
import { Test } from "@nestjs/testing"
import { MailerService } from "@nestjs-modules/mailer"
import { db } from "@config/db"
import type { Role } from "@config/db/generated/enums"
import { AppModule } from "@modules/app.module"
import { GithubClient } from "@modules/github/github.client"

export interface TestUser {
  id: number
  name: string
  email: string
  password: string
  token: string
}

export interface E2EContext {
  app: NestFastifyApplication
  suffix: number
  admin: TestUser
  employee: TestUser
  outsider: TestUser
  createdIds: number[]
  github: { getUser: ReturnType<typeof mock> }
  mailer: { sendMail: ReturnType<typeof mock> }
}

export const as = (user: TestUser) => ({
  authorization: `Bearer ${user.token}`,
})

export const bootApp = async (
  overrides: Pick<E2EContext, "github" | "mailer">,
): Promise<NestFastifyApplication> => {
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(GithubClient)
    .useValue(overrides.github)
    .overrideProvider(MailerService)
    .useValue(overrides.mailer)
    .compile()

  const app = module.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  )
  app.setGlobalPrefix("/api")
  await app.init()
  await app.getHttpAdapter().getInstance().ready()
  return app
}

export const login = async (
  app: NestFastifyApplication,
  email: string,
  password: string,
) => {
  const res = await app.inject({
    method: "POST",
    url: "/api/auth/login",
    payload: { email, password },
  })
  return res.json<{ accessToken: string }>().accessToken
}

export const useE2E = (scope: string) => {
  const suffix = Date.now()
  const ctx = {
    suffix,
    createdIds: [] as number[],
    github: {
      getUser: mock().mockResolvedValue({
        login: "octocat",
        name: "The Octocat",
      }),
    },
    mailer: { sendMail: mock().mockResolvedValue({ messageId: "test" }) },
  } as E2EContext

  const people: [
    keyof Pick<E2EContext, "admin" | "employee" | "outsider">,
    Role,
  ][] = [
    ["admin", "ADMIN"],
    ["employee", "EMPLOYEE"],
    ["outsider", "EMPLOYEE"],
  ]

  beforeAll(async () => {
    for (const [key, role] of people) {
      const user = {
        name: `E2E ${key}`,
        email: `e2e-${scope}-${key}-${suffix}@dipe.dev`,
        password: `${key}@12345`,
      }
      const created = await db.user.create({
        data: {
          name: user.name,
          email: user.email,
          role,
          passwordHash: await Bun.password.hash(user.password),
        },
      })
      ctx.createdIds.push(created.id)
      ctx[key] = { ...user, id: created.id, token: "" }
    }

    ctx.app = await bootApp(ctx)

    for (const [key] of people) {
      ctx[key].token = await login(ctx.app, ctx[key].email, ctx[key].password)
    }
  })

  afterAll(async () => {
    await db.workspace.deleteMany({
      where: { ownerId: { in: ctx.createdIds } },
    })
    await db.user.deleteMany({ where: { id: { in: ctx.createdIds } } })
    await ctx.app.close()
  })

  return ctx
}
