import { createZodDto } from "nestjs-zod"

import {
  listUserQuerySchema,
  unauthorizedResponseSchema,
  userListResponseSchema,
  userResponseSchema,
  userWorkspacesResponseSchema,
} from "@repo/schema"

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

export class UnauthorizedResponse extends createZodDto(unauthorizedResponseSchema, {
  codec: true,
}) {}
