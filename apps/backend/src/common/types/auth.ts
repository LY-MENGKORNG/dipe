import type { Role } from "@config/db/generated/enums";
import type { FastifyRequest } from "fastify";

export interface AuthUser {
  sub: number;
  email: string;
  role: Role;
}

export type AuthRequest = FastifyRequest & { user?: AuthUser };
