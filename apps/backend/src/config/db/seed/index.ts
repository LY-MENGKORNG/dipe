// #!/usr/bin/env bun

import { db } from "@config/db"
import { userSeed } from "./user.seed"
import { workspaceSeed } from "./workspace.seed"
import { projectSeed } from "./project.seed"

void (await db.$transaction(async (tx) => {
  const users = await userSeed(tx)
  const workspaces = await workspaceSeed(tx)
  await projectSeed(tx, workspaces)
}))

void (await db.$disconnect())
