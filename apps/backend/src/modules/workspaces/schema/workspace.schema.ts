import { z } from "zod/v4"
import { Role, WorkspaceVisibility } from "@config/db/generated/enums"
import { commonSchema } from "@common/helpers/schema"

export const workspaceFields = {
  id: z.number().int().min(1),
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, digits and -"),
  visibility: z.enum(WorkspaceVisibility),
  ownerId: z.number().int().min(1),
} as const

export const workspaceSchema = z.object(workspaceFields)

export const createWorkspaceSchema = z.object({
  name: workspaceFields.name,
  slug: workspaceFields.slug.optional(),
  visibility: workspaceFields.visibility.default("PRIVATE"),
})

export const updateWorkspaceSchema = z
  .object({
    name: workspaceFields.name,
    slug: workspaceFields.slug,
    visibility: workspaceFields.visibility,
  })
  .partial()

export const listWorkspaceQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  visibility: workspaceFields.visibility.optional(),
  ...commonSchema,
})

export const listWorkspaceResponseSchema = z.object({
  data: workspaceSchema.array(),
  total: z.int().nonnegative(),
  ...commonSchema,
})

export const addWorkspaceMemberSchema = z.object({
  userId: z.number().int().min(1),
})

export const workspaceMemberSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  email: z.email(),
  role: z.enum(Role),
})

export const workspaceMemberListSchema = z.object({
  data: workspaceMemberSchema.array(),
  total: z.int().nonnegative(),
})
