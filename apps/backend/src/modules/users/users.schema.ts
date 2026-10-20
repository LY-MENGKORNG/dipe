import { ROLES } from "@common/constants/role";
import { z } from "zod/v4"

const userFields = {
  name: z.string().trim().min(2).max(80),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128),
  role: z.enum(ROLES),
  isActive: z.boolean(),
};

export const createUserSchema = z.object({
  ...userFields,
  role: userFields.role.default("employee"),
  isActive: userFields.isActive.default(true),
});

export const updateUserSchema = z.object(userFields).partial();

export const listUserQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  role: z.enum(ROLES).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const userResponseSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.email(),
  role: z.enum(ROLES),
  isActive: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const userListResponseSchema = z.object({
  data: z.array(userResponseSchema),
  total: z.number().int(),
  limit: z.number().int(),
  offset: z.number().int(),
});
