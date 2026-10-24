import { Reflector } from "@nestjs/core"
import type { Role } from "@config/db/generated/enums"

/**
 * Allowed roles
 */
export const Roles = Reflector.createDecorator<Role[]>()
