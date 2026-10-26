import type { User } from "../generated/client"
import type { PrismaTx } from "@common/database"
import { fakeUsers } from "./fakers/user.faker"

export async function userSeed(tx: PrismaTx): Promise<User[]> {
  const seededUsers = await tx.user.createManyAndReturn({
    data: fakeUsers,
    skipDuplicates: true,
  })

  console.log(`users seeded.`)

  return seededUsers
}
