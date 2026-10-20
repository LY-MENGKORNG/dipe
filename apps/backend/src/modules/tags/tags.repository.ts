import { Injectable } from "@nestjs/common";
import { BaseRepository } from "@common/database";
import type { Prisma } from "@config/db/generated/client";

@Injectable()
export class TagRepository extends BaseRepository {
  findMany() {
    return this.db.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { posts: true } } },
    });
  }

  findById(id: number) {
    return this.db.tag.findUnique({ where: { id } });
  }

  create(data: Prisma.TagCreateInput) {
    return this.db.tag.create({ data });
  }

  delete(id: number) {
    return this.db.tag.delete({ where: { id } });
  }
}
