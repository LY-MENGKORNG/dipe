import { Module } from "@nestjs/common";
import { PostsModule } from "@modules/posts/posts.module";
import { TagsController } from "./tags.controller";
import { TagRepository } from "./tags.repository";
import { TagsService } from "./tags.service";

@Module({
  imports: [PostsModule],
  controllers: [TagsController],
  providers: [TagsService, TagRepository],
})
export class TagsModule {}
