import { Injectable, NotFoundException } from "@nestjs/common";
import { PostRepository } from "@modules/posts/posts.repository";
import type { CreateTagDto } from "./dto/tags.dto";
import { TagRepository } from "./tags.repository";

@Injectable()
export class TagsService {
  constructor(
    private readonly repository: TagRepository,
    private readonly posts: PostRepository,
  ) {}

  async findAll() {
    const tags = await this.repository.findMany();
    return tags.map(({ _count, ...tag }) => ({ ...tag, postCount: _count.posts }));
  }

  create(dto: CreateTagDto) {
    return this.repository.create(dto);
  }

  async findPosts(id: number) {
    const tag = await this.repository.findById(id);
    if (!tag) throw new NotFoundException(`Tag #${id} not found`);
    return this.posts.findMany({ tagId: id });
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}
