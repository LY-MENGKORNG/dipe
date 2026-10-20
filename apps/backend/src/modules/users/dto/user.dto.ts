import { createZodDto } from "nestjs-zod";

import {
  listUserQuerySchema,
  userListResponseSchema,
  userPostsResponseSchema,
  userResponseSchema,
} from "../users.schema";

export class ListUserQuery extends createZodDto(listUserQuerySchema) {}

export class UserResponseDto extends createZodDto(userResponseSchema) {}

export class UserPostsResponseDto extends createZodDto(userPostsResponseSchema) {}

export class UserListResponseDto extends createZodDto(userListResponseSchema) {}
