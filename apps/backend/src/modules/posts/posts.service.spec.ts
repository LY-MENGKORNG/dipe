import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PostRepository } from './posts.repository';

describe('PostsService', () => {
  let service: PostsService;
  const repository = { findMany: mock(), replaceTags: mock() };

  beforeEach(async () => {
    Object.values(repository).forEach((fn) => fn.mockReset());

    const module: TestingModule = await Test.createTestingModule({
      providers: [PostsService, { provide: PostRepository, useValue: repository }],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('passes the tag filter to the repository', async () => {
    repository.findMany.mockResolvedValue([]);

    await service.findMany({ tag: "prisma" });

    expect(repository.findMany).toHaveBeenCalledWith({ tag: "prisma" });
  });

  it('drops duplicate tag ids before replacing tags', async () => {
    repository.replaceTags.mockResolvedValue({});

    await service.replaceTags(1, { tagIds: [2, 3, 2] });

    expect(repository.replaceTags).toHaveBeenCalledWith(1, [2, 3]);
  });
});
