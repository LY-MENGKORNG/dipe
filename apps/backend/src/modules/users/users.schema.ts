import { ROLES } from "@common/constants/role";
import { commonSchema, isoDate, omit } from "@common/helpers/schema";
import { postResponseSchema } from "@modules/posts/schema/posts.schema";
import { z } from "zod/v4";

export const userFields = {
  id: z.number().int().min(1),
  name: z.string().trim().min(2).max(80),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128),
  role: z.enum(ROLES),
  isActive: z.boolean(),
} as const;

export const createUserSchema = z.object({
  ...omit(userFields, ["id"]),
  role: userFields.role.default("employee"),
  isActive: userFields.isActive.default(true),
});

export const updateUserSchema = z.object(omit(userFields, ["id"])).partial();

export const listUserQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  role: z.enum(ROLES).optional(),
  ...commonSchema,
});

export const userResponseSchema = z.object({
  id: userFields.id,
  name: z.string(),
  email: z.email(),
  role: z.enum(ROLES),
  isActive: z.boolean(),
  createdAt: isoDate,
  updatedAt: isoDate,
});

export const userPostsResponseSchema = userResponseSchema.extend({
  posts: postResponseSchema.omit({ authorId: true }).array(),
});

export const userListResponseSchema = z.object({
  data: userResponseSchema.array(),
  total: z.int().nonnegative(),
  ...commonSchema,
});
