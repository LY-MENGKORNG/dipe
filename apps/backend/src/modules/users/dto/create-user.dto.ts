import { createZodDto } from "nestjs-zod";
import {
  createUserSchema,
  listUserQuerySchema,
  userListResponseSchema,
  userResponseSchema,
} from "../users.schema";

export class CreateUserDto extends createZodDto(createUserSchema) {}

export class ListUserQuery extends createZodDto(listUserQuerySchema) {}

export class UserResponseDto extends createZodDto(userResponseSchema) {}

export class UserListResponseDto extends createZodDto(userListResponseSchema) {}
