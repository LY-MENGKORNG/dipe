import { users } from "./user.seed";
import { PrismaTx } from "@common/database";

const tags = ["nestjs", "prisma", "postgres", "bun"];

const posts = [
  { title: "Getting started with NestJS", tags: ["nestjs", "bun"] },
  { title: "Many-to-many with Prisma", tags: ["prisma", "postgres"] },
  { title: "Transactions in a repository", tags: ["nestjs", "prisma"] },
];

export async function postSeed(tx: PrismaTx) {
  for (const name of tags) {
    await tx.tag.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log(`seeded tags: ${tags.join(", ")}`);

  const author = await tx.user.findUniqueOrThrow({ where: { email: users[0].email } });

  for (const post of posts) {
    if (await tx.post.findFirst({ where: { title: post.title } })) continue;

    await tx.post.create({
      data: {
        title: post.title,
        author: { connect: { id: author.id } },
        tags: { create: post.tags.map((name) => ({ tag: { connect: { name } } })) },
      },
    });
    console.log(`seeded post: ${post.title}`);
  }
}
