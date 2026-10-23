import { createZodDto } from "nestjs-zod";

import { createTagSchema, tagListResponseSchema, tagResponseSchema } from "../schema/tags.schema";

export class CreateTagDto extends createZodDto(createTagSchema) {}

export class TagResponseDto extends createZodDto(tagResponseSchema, { codec: true }) {}

export class TagListResponseDto extends createZodDto(tagListResponseSchema, { codec: true }) {}
