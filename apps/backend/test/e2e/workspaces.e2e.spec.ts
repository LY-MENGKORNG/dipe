import { describe, expect, it } from "bun:test"
import { db } from "@config/db"
import { as, useE2E } from "./app"

describe("Workspaces & projects (e2e)", () => {
  const t = useE2E("workspaces")
  let workspaceId: number
  let projectId: string

  it("creates a private workspace owned by the caller", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: "/api/workspaces",
      headers: as(t.employee),
      payload: { name: `E2E Space ${t.suffix}` },
    })
    expect(res.statusCode).toBe(201)
    expect(res.json()).toMatchObject({
      slug: `e2e-space-${t.suffix}`,
      visibility: "PRIVATE",
    })
    workspaceId = res.json<{ id: number }>().id
  })

  it("hides the private workspace from outsiders with 404", async () => {
    const one = await t.app.inject({
      method: "GET",
      url: `/api/workspaces/${workspaceId}`,
      headers: as(t.outsider),
    })
    expect(one.statusCode).toBe(404)

    const list = await t.app.inject({
      method: "GET",
      url: "/api/workspaces?limit=100",
      headers: as(t.outsider),
    })
    const ids = list.json<{ data: { id: number }[] }>().data.map((w) => w.id)
    expect(ids).not.toContain(workspaceId)
  })

  it("lets the owner add members, but only once", async () => {
    const add = () =>
      t.app.inject({
        method: "POST",
        url: `/api/workspaces/${workspaceId}/members`,
        headers: as(t.employee),
        payload: { userId: t.outsider.id },
      })

    expect((await add()).statusCode).toBe(201)
    expect((await add()).statusCode).toBe(409)

    const visible = await t.app.inject({
      method: "GET",
      url: `/api/workspaces/${workspaceId}`,
      headers: as(t.outsider),
    })
    expect(visible.statusCode).toBe(200)
  })

  it("forbids members who are not the owner from renaming with 403", async () => {
    const res = await t.app.inject({
      method: "PATCH",
      url: `/api/workspaces/${workspaceId}`,
      headers: as(t.outsider),
      payload: { name: "Taken over" },
    })
    expect(res.statusCode).toBe(403)
  })

  it("makes the project creator its LEAD", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: `/api/workspaces/${workspaceId}/projects`,
      headers: as(t.employee),
      payload: {
        name: `E2E Project ${t.suffix}`,
        budget: 1500,
        deadline: "2027-01-31T00:00:00.000Z",
      },
    })
    expect(res.statusCode).toBe(201)
    expect(res.json()).toMatchObject({
      currency: "USD",
      deadline: "2027-01-31T00:00:00.000Z",
    })
    projectId = res.json<{ id: string }>().id

    const members = await t.app.inject({
      method: "GET",
      url: `/api/projects/${projectId}/members`,
      headers: as(t.outsider),
    })
    expect(members.json()).toMatchObject({
      total: 1,
      data: [{ email: t.employee.email, role: "LEAD" }],
    })
  })

  it("only adds workspace members to a project", async () => {
    const stranger = await t.app.inject({
      method: "POST",
      url: `/api/projects/${projectId}/members`,
      headers: as(t.employee),
      payload: { userId: t.admin.id },
    })
    expect(stranger.statusCode).toBe(422)

    const dev = await t.app.inject({
      method: "POST",
      url: `/api/projects/${projectId}/members`,
      headers: as(t.employee),
      payload: { userId: t.outsider.id, role: "DEVELOPER" },
    })
    expect(dev.statusCode).toBe(201)
  })

  it("forbids a DEVELOPER from editing the project with 403", async () => {
    const res = await t.app.inject({
      method: "PATCH",
      url: `/api/projects/${projectId}`,
      headers: as(t.outsider),
      payload: { budget: 1 },
    })
    expect(res.statusCode).toBe(403)
  })

  it("refuses to let the owner leave with 409", async () => {
    const owner = await db.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
    })
    const res = await t.app.inject({
      method: "DELETE",
      url: `/api/workspaces/${workspaceId}/members/${owner.ownerId}`,
      headers: as(t.employee),
    })
    expect(res.statusCode).toBe(409)
  })

  it("deletes the workspace together with its projects", async () => {
    const removed = await t.app.inject({
      method: "DELETE",
      url: `/api/workspaces/${workspaceId}`,
      headers: as(t.employee),
    })
    expect(removed.statusCode).toBe(200)

    const project = await t.app.inject({
      method: "GET",
      url: `/api/projects/${projectId}`,
      headers: as(t.employee),
    })
    expect(project.statusCode).toBe(404)
  })
})
