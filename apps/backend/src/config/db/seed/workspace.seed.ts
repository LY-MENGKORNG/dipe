import { type PrismaTx } from "@common/database"
import { type Workspace } from "../generated/client"

const workspaces: Workspace[] = [
  {
    id: 1,
    name: "Default",
    slug: "default",
  },
  {
    id: 2,
    name: "Training",
    slug: "traing",
  },
  {
    id: 3,
    name: "Conversation",
    slug: "conversation",
  },
]
export async function workspaceSeed(tx: PrismaTx) {
  for (const workspace of workspaces) {
    await tx.workspace.upsert({
      where: { slug: workspace.slug, id: workspace.id, name: workspace.name },
      update: {},
      create: workspace,
    })
    console.log(`seeded workspace: ${workspace.name}`)
  }
  return workspaces
}
