import { describe, expect, it } from "bun:test"
import { as, useE2E } from "./app"

describe("GitHub proxy (e2e)", () => {
  const t = useE2E("github")

  it("proxies the GitHub profile through the mocked client", async () => {
    const res = await t.app.inject({
      method: "GET",
      url: "/api/github/users/octocat",
      headers: as(t.employee),
    })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ login: "octocat" })
    expect(t.github.getUser).toHaveBeenCalledWith("octocat")
  })
})
