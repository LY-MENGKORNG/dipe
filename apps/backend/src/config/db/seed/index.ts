#!/usr/bin/env bun

import { db } from "@config/db"
import { userSeed } from "./user.seed"
import { workspaceSeed } from "./workspace.seed"
import { projectSeed } from "./project.seed"

await db.$transaction(async (tx) => {
  await userSeed(tx)
  await workspaceSeed(tx)
  await projectSeed(tx)

  await tx.$executeRaw`SELECT setval(pg_get_serial_sequence('"user"', 'id'), (SELECT MAX("id") FROM "user"))`
  await tx.$executeRaw`SELECT setval(pg_get_serial_sequence('"workspace"', 'id'), (SELECT MAX("id") FROM "workspace"))`
})

await db.$disconnect()
