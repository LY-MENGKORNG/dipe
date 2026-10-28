import { describe, expect, it } from "bun:test"
import { db } from "@config/db"
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

  describe("GitHub login", () => {
    const githubAs = (email: string) => {
      t.github.authorize.mockResolvedValue({
        access_token: "gho_token",
        token_type: "bearer",
        scope: "read:user,user:email",
      })
      t.github.getProfile.mockResolvedValue({ login: "octocat", name: null })
      t.github.getEmails.mockResolvedValue([
        { email, primary: true, verified: true },
      ])
    }

    const callback = (query: string) =>
      t.app.inject({ method: "GET", url: `/api/auth/callback/github${query}` })

    const exchange = (code: string) =>
      t.app.inject({
        method: "POST",
        url: "/api/auth/github/exchange",
        payload: { code },
      })

    it("signs in an existing user through a one-time code", async () => {
      githubAs(t.employee.email)

      const redirect = await callback("?code=gh-code")
      expect(redirect.statusCode).toBe(302)
      const code = new URL(redirect.headers.location!).searchParams.get("code")
      expect(code).toBeTruthy()

      const res = await exchange(code!)
      expect(res.statusCode).toBe(200)

      const me = await t.app.inject({
        method: "GET",
        url: "/api/auth/me",
        headers: {
          authorization: `Bearer ${res.json<{ accessToken: string }>().accessToken}`,
        },
      })
      expect(me.json()).toMatchObject({ id: t.employee.id })

      expect((await exchange(code!)).statusCode).toBe(401)
    })

    it("creates a user on first GitHub login", async () => {
      const email = `e2e-auth-github-${t.suffix}@dipe.dev`
      githubAs(email)

      const redirect = await callback("?code=gh-code")
      const created = await db.user.findUnique({ where: { email } })
      if (created) t.createdIds.push(created.id)

      expect(redirect.headers.location).toContain("?code=")
      expect(created).toMatchObject({ name: "octocat", provider: "github" })
    })

    it("redirects with the GitHub error when the code is refused", async () => {
      t.github.authorize.mockResolvedValue({ error: "bad_verification_code" })

      const redirect = await callback("?code=stale")

      expect(redirect.statusCode).toBe(302)
      expect(redirect.headers.location).toBe(
        "http://localhost:5174/auth/login?error=bad_verification_code",
      )
    })

    it("redirects with missing_code when GitHub sends no code", async () => {
      const redirect = await callback("")

      expect(redirect.headers.location).toBe(
        "http://localhost:5174/auth/login?error=missing_code",
      )
    })

    it("rejects a malformed exchange code with 400", async () => {
      expect((await exchange("not-a-uuid")).statusCode).toBe(400)
    })
  })
})
