import { createZodDto } from "nestjs-zod"

import {
  listUserQuerySchema,
  userListResponseSchema,
  userResponseSchema,
  userWorkspacesResponseSchema,
} from "../users.schema"

export class ListUserQuery extends createZodDto(listUserQuerySchema) {}

export class UserResponseDto extends createZodDto(userResponseSchema, {
  codec: true,
}) {}

export class UserWorkspacesResponseDto extends createZodDto(
  userWorkspacesResponseSchema,
  {
    codec: true,
  },
) {}

export class UserListResponseDto extends createZodDto(userListResponseSchema, {
  codec: true,
}) {}
