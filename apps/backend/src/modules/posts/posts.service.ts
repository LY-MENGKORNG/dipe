import { Injectable } from "@nestjs/common";
import { PostRepository } from "./posts.repository";
import type { ListPostQuery, ReplacePostTagsDto } from "./dto/posts.dto";

@Injectable()
export class PostsService {
  constructor(private readonly repository: PostRepository) {}

  findMany(query: ListPostQuery = {}) {
    return this.repository.findMany(query);
  }

  replaceTags(id: number, { tagIds }: ReplacePostTagsDto) {
    return this.repository.replaceTags(id, [...new Set(tagIds)]);
  }
}
