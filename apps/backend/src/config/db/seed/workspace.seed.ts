import type { PrismaTx } from "@common/database"
import type { Workspace } from "../generated/client"
import { fakeWorkspaceMembers, fakeWorkspaces } from "./fakers/workspace.faker"

export async function workspaceSeed(tx: PrismaTx): Promise<Workspace[]> {
  const seededWorkspaces = await tx.workspace.createManyAndReturn({
    data: fakeWorkspaces,
    skipDuplicates: true,
  })

  await tx.workspaceMember.createMany({
    data: fakeWorkspaceMembers,
    skipDuplicates: true,
  })

  console.log(`workspaces seeded.`)

  return seededWorkspaces
}
