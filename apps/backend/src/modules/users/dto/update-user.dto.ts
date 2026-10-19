import { createZodDto } from "nestjs-zod";
import { updateUserSchema } from "./create-user.dto";

export class UpdateUserDto extends createZodDto(updateUserSchema) {}
