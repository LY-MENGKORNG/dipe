import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PostRepository } from "@modules/posts/posts.repository";
import { TagRepository } from "./tags.repository";
import { TagsService } from "./tags.service";

const tag = { id: 1, name: "prisma", createdAt: new Date() };

describe("TagsService", () => {
  let service: TagsService;
  const repository = { findMany: mock(), findById: mock(), create: mock(), delete: mock() };
  const posts = { findMany: mock() };

  beforeEach(async () => {
    Object.values(repository).forEach((fn) => fn.mockReset());
    posts.findMany.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        TagsService,
        { provide: TagRepository, useValue: repository },
        { provide: PostRepository, useValue: posts },
      ],
    }).compile();

    service = module.get(TagsService);
  });

  it("maps the relation count to postCount", async () => {
    repository.findMany.mockResolvedValue([{ ...tag, _count: { posts: 3 } }]);

    expect(await service.findAll()).toEqual([{ ...tag, postCount: 3 }]);
  });

  it("lists the posts of an existing tag", async () => {
    repository.findById.mockResolvedValue(tag);
    posts.findMany.mockResolvedValue([]);

    await service.findPosts(1);

    expect(posts.findMany).toHaveBeenCalledWith({ tagId: 1 });
  });

  it("throws NotFoundException for posts of a missing tag", async () => {
    repository.findById.mockResolvedValue(null);

    const error = await service.findPosts(99).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(NotFoundException);
    expect(posts.findMany).not.toHaveBeenCalled();
  });
});
