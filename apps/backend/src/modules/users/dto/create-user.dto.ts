import { createZodDto } from "nestjs-zod";
import {
  createUserSchema,
} from "../users.schema";

export class CreateUserDto extends createZodDto(createUserSchema) {}
