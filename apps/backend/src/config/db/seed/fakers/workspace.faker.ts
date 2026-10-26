import type { Workspace, WorkspaceMember } from "@config/db/generated/client"
import { fakeUsers } from "./user.faker"

export const fakeWorkspaces = [
  {
    id: 1,
    ownerId: fakeUsers[0].id ?? 1,
    visibility: "PUBLIC",
    name: "Default",
    slug: "default",
  },
  {
    id: 2,
    ownerId: fakeUsers[1].id ?? 2,
    visibility: "PUBLIC",
    name: "Training",
    slug: "training",
  },
  {
    id: 3,
    ownerId: fakeUsers[2].id ?? 3,
    visibility: "PRIVATE",
    name: "Conversation",
    slug: "conversation",
  },
] as const satisfies Workspace[]

export const fakeWorkspaceMembers = [
  ...fakeWorkspaces.map((w) => ({ userId: w.ownerId, workspaceId: w.id })),
  { userId: fakeUsers[1].id, workspaceId: fakeWorkspaces[0].id },
  { userId: fakeUsers[2].id, workspaceId: fakeWorkspaces[0].id },
] as const satisfies WorkspaceMember[]
