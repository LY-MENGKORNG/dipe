import { z } from "zod/v4"
import { isoDate, commonSchema, omit } from "../helper"
import { $Enums } from "@repo/types"
import { workspaceSchema } from "./workspace.schema"

export const userFields = {
  id: z.number().int().min(1),
  name: z.string().trim().min(2).max(80),
  email: z.email().toLowerCase(),
  password: z.string().min(8).max(128),
  role: z.enum($Enums.Role),
  isActive: z.boolean(),
} as const

const userFieldsNoId = omit(userFields, ["id"])

export const createUserSchema = z.object({
  ...userFieldsNoId,
  role: userFields.role.default("EMPLOYEE"),
  isActive: userFields.isActive.default(true),
})

export const updateUserSchema = z.object(userFieldsNoId).partial()

export const listUserQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  role: z.enum($Enums.Role).optional(),
  ...commonSchema,
})

export const userResponseSchema = z.object({
  id: userFields.id,
  name: userFields.name,
  email: userFields.email,
  role: userFields.role,
  isActive: userFields.isActive,
  createdAt: isoDate,
  updatedAt: isoDate,
})

export const userListResponseSchema = z.object({
  data: userResponseSchema.array(),
  total: z.int().nonnegative(),
  ...commonSchema,
})

export const userWorkspacesResponseSchema = z.object({
  id: userFields.id,
  name: userFields.name,
  email: userFields.email,
  role: userFields.role,
  isActive: userFields.isActive,
  createdAt: isoDate,
  updatedAt: isoDate,
  workspaces: workspaceSchema.array(),
  createdWorkspaces: workspaceSchema.omit({ ownerId: true }).array(),
})

export const unauthorizedResponseSchema = z.object({
  message: z.string().default("Missing bearer token"),
  error: z.string().default("Unauthorized"),
  statusCode: z.number().default(401),
})
