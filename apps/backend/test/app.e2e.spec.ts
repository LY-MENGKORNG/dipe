/**
 * @NOTE: End-to-end (E2E) testing is a software testing methodology that validates an application’s complete workflow
 * from start to finish, simulating real-world user scenarios to ensure all integrated components function correctly.
 */

import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test"
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify"
import { Test } from "@nestjs/testing"
import { MailerService } from "@nestjs-modules/mailer"
import { TransactionHost } from "@common/database"
import { db } from "@config/db"
import { AppModule } from "@modules/app.module"
import { GithubClient } from "@modules/github/github.client"
import { UserRepository } from "@modules/users/users.repository"

const suffix = Date.now()
const admin = {
  name: "E2E Admin",
  email: `e2e-admin-${suffix}@dipe.dev`,
  password: "Admin@12345",
}
const employee = {
  name: "E2E Employee",
  email: `e2e-emp-${suffix}@dipe.dev`,
  password: "Employee@12345",
}

describe("DIPE API (e2e)", () => {
  let app: NestFastifyApplication
  let adminToken: string
  let employeeToken: string
  const createdIds: number[] = []
  const github = {
    getUser: mock().mockResolvedValue({
      login: "octocat",
      name: "The Octocat",
    }),
  }
  const mailer = { sendMail: mock().mockResolvedValue({ messageId: "test" }) }

  const login = async (email: string, password: string) => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email, password },
    })
    return res.json<{ accessToken: string }>().accessToken
  }

  const as = (token: string) => ({ authorization: `Bearer ${token}` })

  beforeAll(async () => {
    for (const [user, role] of [
      [admin, "admin"],
      [employee, "employee"],
    ] as const) {
      const created = await db.user.create({
        data: {
          name: user.name,
          email: user.email,
          role,
          passwordHash: await Bun.password.hash(user.password),
        },
      })
      createdIds.push(created.id)
    }

    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(GithubClient)
      .useValue(github)
      .overrideProvider(MailerService)
      .useValue(mailer)
      .compile()

    app = module.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    )
    app.setGlobalPrefix("/api")
    await app.init()
    await app.getHttpAdapter().getInstance().ready()

    adminToken = await login(admin.email, admin.password)
    employeeToken = await login(employee.email, employee.password)
  })

  afterAll(async () => {
    await db.user.deleteMany({ where: { id: { in: createdIds } } })
    await app.close()
  })

  describe("auth", () => {
    it("rejects bad credentials with 401", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: admin.email, password: "wrong" },
      })
      expect(res.statusCode).toBe(401)
    })

    it("rejects an invalid body with 400", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: "nope" },
      })
      expect(res.statusCode).toBe(400)
    })

    it("returns the current user without the password hash", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: as(adminToken),
      })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({ email: admin.email, role: "admin" })
      expect(res.json()).not.toHaveProperty("password_hash")
    })
  })

  describe("users", () => {
    it("rejects anonymous requests with 401", async () => {
      const res = await app.inject({ method: "GET", url: "/api/users" })
      expect(res.statusCode).toBe(401)
    })

    it("lists users for any authenticated user", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/users?limit=5",
        headers: as(employeeToken),
      })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({ limit: 5, offset: 0 })
      expect(res.json<{ data: unknown[] }>().data.length).toBeLessThanOrEqual(5)
    })

    it("rejects a non-numeric id with 400", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/users/abc",
        headers: as(adminToken),
      })
      expect(res.statusCode).toBe(400)
    })

    it("forbids employees from creating users with 403", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/users",
        headers: as(employeeToken),
        payload: {
          name: "Nope",
          email: `nope-${suffix}@dipe.dev`,
          password: "Password1",
        },
      })
      expect(res.statusCode).toBe(403)
    })

    it("lets an admin create, update and delete a user", async () => {
      const email = `crud-${suffix}@dipe.dev`
      const created = await app.inject({
        method: "POST",
        url: "/api/users",
        headers: as(adminToken),
        payload: { name: "Crud User", email, password: "Password1" },
      })
      expect(created.statusCode).toBe(201)
      const { id } = created.json<{ id: number }>()
      createdIds.push(id)

      const duplicate = await app.inject({
        method: "POST",
        url: "/api/users",
        headers: as(adminToken),
        payload: { name: "Crud User", email, password: "Password1" },
      })
      expect(duplicate.statusCode).toBe(409)

      const updated = await app.inject({
        method: "PATCH",
        url: `/api/users/${id}`,
        headers: as(adminToken),
        payload: { name: "Crud Renamed" },
      })
      expect(updated.statusCode).toBe(200)
      expect(updated.json()).toMatchObject({
        name: "Crud Renamed",
        role: "employee",
      })

      const removed = await app.inject({
        method: "DELETE",
        url: `/api/users/${id}`,
        headers: as(adminToken),
      })
      expect(removed.statusCode).toBe(200)

      const missing = await app.inject({
        method: "GET",
        url: `/api/users/${id}`,
        headers: as(adminToken),
      })
      expect(missing.statusCode).toBe(404)
    })
  })

  describe("transactions", () => {
    it("rolls back every repository write when the callback throws", async () => {
      const transactions = app.get(TransactionHost)
      const users = app.get(UserRepository)
      const email = `rollback-${suffix}@dipe.dev`

      const error = await transactions
        .run(async () => {
          await users.create({ name: "Rollback", email, passwordHash: "x" })
          expect(await users.findByEmailWithSecret(email)).not.toBeNull()
          throw new Error("boom")
        })
        .catch((e: unknown) => e)

      expect((error as Error).message).toBe("boom")
      expect(await db.user.findUnique({ where: { email } })).toBeNull()
    })

    it("commits every repository write when the callback succeeds", async () => {
      const transactions = app.get(TransactionHost)
      const users = app.get(UserRepository)
      const email = `commit-${suffix}@dipe.dev`

      const created = await transactions.run(() =>
        users.create({ name: "Commit", email, passwordHash: "x" }),
      )
      createdIds.push(created.id)

      expect(await db.user.findUnique({ where: { email } })).not.toBeNull()
    })
  })

  describe("queue", () => {
    it("processes a welcome email job when a user is created", async () => {
      const email = `queue-${suffix}@dipe.dev`
      const created = await app.inject({
        method: "POST",
        url: "/api/users",
        headers: as(adminToken),
        payload: { name: "Queue User", email, password: "Password1" },
      })
      expect(created.statusCode).toBe(201)
      createdIds.push(created.json<{ id: number }>().id)

      type Overview = { recent: { state: string; data: { email: string } }[] }
      let job: Overview["recent"][number] | undefined

      for (let i = 0; i < 40 && job?.state !== "completed"; i++) {
        await Bun.sleep(100)
        const res = await app.inject({
          method: "GET",
          url: "/api/jobs/email",
          headers: as(adminToken),
        })
        job = res.json<Overview>().recent.find((j) => j.data.email === email)
      }

      expect(job?.state).toBe("completed")
      expect(mailer.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          template: "welcome",
          context: { name: "Queue User", email },
        }),
      )
    })

    it("hides the jobs dashboard from employees", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/jobs/email",
        headers: as(employeeToken),
      })
      expect(res.statusCode).toBe(403)
    })
  })

  describe("github", () => {
    it("proxies the GitHub profile through the mocked client", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/github/users/octocat",
        headers: as(employeeToken),
      })
      expect(res.statusCode).toBe(200)
      expect(res.json()).toMatchObject({ login: "octocat" })
      expect(github.getUser).toHaveBeenCalledWith("octocat")
    })
  })

  describe("rate limiting", () => {
    it("returns 429 with Retry-After once login is hammered", async () => {
      let res = await app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: admin.email, password: "x" },
      })

      for (let i = 0; i < 10 && res.statusCode !== 429; i++) {
        res = await app.inject({
          method: "POST",
          url: "/api/auth/login",
          payload: { email: admin.email, password: "x" },
        })
      }

      expect(res.statusCode).toBe(429)
      expect(res.headers["retry-after"]).toBeDefined()
    })
  })
})
