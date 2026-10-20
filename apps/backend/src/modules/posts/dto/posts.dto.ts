import { createZodDto } from "nestjs-zod";

import {
  listPostQuerySchema,
  postListResponseSchema,
  postResponseSchema,
  postWithRelationsSchema,
  replacePostTagsSchema,
} from "../schema/posts.schema";

export class PostResponseDto extends createZodDto(postResponseSchema) {}

export class PostWithRelationsResponseDto extends createZodDto(postWithRelationsSchema) {}

export class PostListResponseDto extends createZodDto(postListResponseSchema) {}

export class ListPostQuery extends createZodDto(listPostQuerySchema) {}

export class ReplacePostTagsDto extends createZodDto(replacePostTagsSchema) {}
