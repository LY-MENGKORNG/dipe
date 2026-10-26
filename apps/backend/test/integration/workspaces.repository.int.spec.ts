import { beforeAll, describe, expect, it } from "bun:test"
import { db } from "@config/db"
import { WorkspaceRepository } from "@modules/workspaces/workspaces.repository"
import { useDatabase } from "./db"

describe("WorkspaceRepository (integration)", () => {
  const t = useDatabase([WorkspaceRepository])
  let ownerId: number
  let strangerId: number
  let workspaceId: number

  beforeAll(async () => {
    const [owner, stranger] = await Promise.all(
      ["owner", "stranger"].map((who) =>
        db.user.create({
          data: {
            name: who,
            email: `ws-${who}-${t.suffix}@dipe.dev`,
            passwordHash: "x",
          },
        }),
      ),
    )
    ownerId = owner.id
    strangerId = stranger.id
    t.userIds.push(ownerId, strangerId)
  })

  it("adds the owner as the first member in the same write", async () => {
    const workspaces = t.get(WorkspaceRepository)

    const workspace = await workspaces.create({
      name: "Private Space",
      slug: `private-space-${t.suffix}`,
      ownerId,
    })
    workspaceId = workspace.id

    expect(workspace.visibility).toBe("PRIVATE")
    expect(await workspaces.isMember(workspaceId, ownerId)).toBeTrue()
  })

  it("hides a private workspace from non-members", async () => {
    const workspaces = t.get(WorkspaceRepository)
    const query = { q: `private-space-${t.suffix}`, limit: 10, offset: 0 }

    const [forOwner, forStranger] = await Promise.all([
      workspaces.findMany(query, ownerId),
      workspaces.findMany(query, strangerId),
    ])

    expect(forOwner.data.map((w) => w.id)).toEqual([workspaceId])
    expect(forStranger.total).toBe(0)
  })

  it("lets Postgres reject a duplicate slug", async () => {
    const workspaces = t.get(WorkspaceRepository)

    const error = await workspaces
      .create({
        name: "Copy",
        slug: `private-space-${t.suffix}`,
        ownerId: strangerId,
      })
      .catch((e: unknown) => e)

    expect(error).toMatchObject({ code: "P2002" })
  })
})
