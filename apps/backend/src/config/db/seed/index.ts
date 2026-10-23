// #!/usr/bin/env bun

import { db } from "@config/db";
import { userSeed } from "./user.seed";
import { postSeed } from "./post.seed";
import { orderSeed } from "./order.seed";

await db.$transaction(async (tx) => {
  await userSeed(tx);
  await postSeed(tx);
  await orderSeed(tx);
});

await db.$disconnect();
