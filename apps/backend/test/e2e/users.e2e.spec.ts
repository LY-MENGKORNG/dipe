import { describe, expect, it } from "bun:test"
import { as, useE2E } from "./app"

describe("Users (e2e)", () => {
  const t = useE2E("users")

  it("rejects anonymous users with 401", async () => {
    const res = await t.app.inject({ method: "GET", url: "/api/users" })
    expect(res.statusCode).toBe(401)
  })

  it("forbids employees from deleting users with 403", async () => {
    const res = await t.app.inject({
      method: "DELETE",
      url: `/api/users/${t.admin.id}`,
      headers: as(t.employee),
    })
    expect(res.statusCode).toBe(403)
  })

  it("forbids employees from creating users with 403", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: "/api/users",
      headers: as(t.employee),
      payload: {
        name: "Nope",
        email: `nope-${t.suffix}@dipe.dev`,
        password: "Password1",
      },
    })
    expect(res.statusCode).toBe(403)
  })

  it("lists users for an admin", async () => {
    const res = await t.app.inject({
      method: "GET",
      url: "/api/users?limit=5",
      headers: as(t.admin),
    })
    expect(res.statusCode).toBe(200)
    expect(res.json()).toMatchObject({ limit: 5, offset: 0 })
    expect(res.json<{ data: unknown[] }>().data.length).toBeLessThanOrEqual(5)
  })

  it("rejects a bad email with 400", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: "/api/users",
      headers: as(t.admin),
      payload: { name: "Bad", email: "not-an-email", password: "Password1" },
    })
    expect(res.statusCode).toBe(400)
  })

  it("rejects a non-numeric id with 400", async () => {
    const res = await t.app.inject({
      method: "GET",
      url: "/api/users/abc",
      headers: as(t.admin),
    })
    expect(res.statusCode).toBe(400)
  })

  it("lets an admin create, update and delete a user", async () => {
    const email = `crud-${t.suffix}@dipe.dev`
    const create = () =>
      t.app.inject({
        method: "POST",
        url: "/api/users",
        headers: as(t.admin),
        payload: { name: "Crud User", email, password: "Password1" },
      })

    const created = await create()
    expect(created.statusCode).toBe(201)
    const { id } = created.json<{ id: number }>()
    t.createdIds.push(id)

    expect((await create()).statusCode).toBe(409)

    const updated = await t.app.inject({
      method: "PATCH",
      url: `/api/users/${id}`,
      headers: as(t.admin),
      payload: { name: "Crud Renamed" },
    })
    expect(updated.statusCode).toBe(200)
    expect(updated.json()).toMatchObject({
      name: "Crud Renamed",
      role: "EMPLOYEE",
    })

    const removed = await t.app.inject({
      method: "DELETE",
      url: `/api/users/${id}`,
      headers: as(t.admin),
    })
    expect(removed.statusCode).toBe(200)

    const missing = await t.app.inject({
      method: "GET",
      url: `/api/users/${id}`,
      headers: as(t.admin),
    })
    expect(missing.statusCode).toBe(404)
  })
})
