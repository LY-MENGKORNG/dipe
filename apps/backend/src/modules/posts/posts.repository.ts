import { BaseRepository } from "@common/database";
import { Injectable } from "@nestjs/common";
import type { Prisma } from "@config/db/generated/client";

const postWithRelations = {
  omit: { authorId: true },
  include: {
    author: {
      omit: {
        passwordHash: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    tags: {
      select: { tag: { select: { id: true, name: true } } },
      orderBy: { tag: { name: "asc" } },
    },
  },
} as const satisfies Prisma.PostDefaultArgs;

type PostWithRelations = Prisma.PostGetPayload<typeof postWithRelations>;

const flattenTags = ({ tags, ...post }: PostWithRelations) => ({
  ...post,
  tags: tags.map(({ tag }) => tag),
});

@Injectable()
export class PostRepository extends BaseRepository {
  async findMany({ tag, tagId }: { tag?: string; tagId?: number } = {}) {
    const posts = await this.db.post.findMany({
      ...postWithRelations,
      where: {
        ...(tag && { tags: { some: { tag: { name: tag } } } }),
        ...(tagId && { tags: { some: { tagId } } }),
      },
      orderBy: { createdAt: "desc" },
    });
    return posts.map(flattenTags);
  }

  async replaceTags(id: number, tagIds: number[]) {
    const post = await this.db.post.update({
      ...postWithRelations,
      where: { id },
      data: {
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })),
        },
      },
    });
    return flattenTags(post);
  }
}
