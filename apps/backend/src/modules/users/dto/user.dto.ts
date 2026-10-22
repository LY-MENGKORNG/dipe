import { createZodDto } from "nestjs-zod";

import {
  listUserQuerySchema,
  userListResponseSchema,
  userPostsResponseSchema,
  userResponseSchema,
} from "../users.schema";

export class ListUserQuery extends createZodDto(listUserQuerySchema) {}

export class UserResponseDto extends createZodDto(userResponseSchema, { codec: true }) {}

export class UserPostsResponseDto extends createZodDto(userPostsResponseSchema, { codec: true }) {}

export class UserListResponseDto extends createZodDto(userListResponseSchema, { codec: true }) {}
