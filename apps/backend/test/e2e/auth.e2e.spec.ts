import { describe, expect, it } from "bun:test"
import { as, useE2E } from "./app"

describe("Auth (e2e)", () => {
  const t = useE2E("auth")

  it("rejects bad credentials with 401", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: t.admin.email, password: "wrong" },
    })
    expect(res.statusCode).toBe(401)
  })

  it("rejects an invalid body with 400", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "nope" },
    })
    expect(res.statusCode).toBe(400)
  })

  it("returns the current user without the password hash", async () => {
    const res = await t.app.inject({
      method: "GET",
      url: "/api/auth/me",
      headers: as(t.admin),
    })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ email: t.admin.email, role: "ADMIN" })
    expect(res.json()).not.toHaveProperty("password_hash")
  })

  it("returns 429 with Retry-After once login is hammered", async () => {
    const attempt = () =>
      t.app.inject({
        method: "POST",
        url: "/api/auth/login",
        payload: { email: t.admin.email, password: "x" },
      })

    let res = await attempt()
    for (let i = 0; i < 10 && res.statusCode !== 429; i++) {
      res = await attempt()
    }

    expect(res.statusCode).toBe(429)
    expect(res.headers["retry-after"]).toBeDefined()
  })
})
