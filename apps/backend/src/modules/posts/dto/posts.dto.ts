import { createZodDto } from "nestjs-zod";

import {
  listPostQuerySchema,
  postListResponseSchema,
  postResponseSchema,
  postWithRelationsSchema,
  replacePostTagsSchema,
} from "../schema/posts.schema";

export class PostResponseDto extends createZodDto(postResponseSchema, { codec: true }) {}

export class PostWithRelationsResponseDto extends createZodDto(postWithRelationsSchema, {
  codec: true,
}) {}

export class PostListResponseDto extends createZodDto(postListResponseSchema, { codec: true }) {}

export class ListPostQuery extends createZodDto(listPostQuerySchema) {}

export class ReplacePostTagsDto extends createZodDto(replacePostTagsSchema) {}
