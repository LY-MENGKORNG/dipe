import { z } from "zod/v4"
import { isoDate, commonSchema } from "../helper"
import { $Enums } from "@repo/types"

export const projectFields = {
  id: z.uuid(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000),
  budget: z.number().nonnegative(),
  currency: z.enum($Enums.Currency),
  deadline: isoDate.nullable(),
  workspaceId: z.number().int().min(1),
} as const

export const createProjectSchema = z.object({
  name: projectFields.name,
  description: projectFields.description.default(""),
  budget: projectFields.budget,
  currency: projectFields.currency.default("USD"),
  deadline: projectFields.deadline.optional(),
})

export const updateProjectSchema = z
  .object({
    name: projectFields.name,
    description: projectFields.description,
    budget: projectFields.budget,
    currency: projectFields.currency,
    deadline: projectFields.deadline,
  })
  .partial()

export const listProjectQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  ...commonSchema,
})

export const projectResponseSchema = z.object({
  ...projectFields,
  createdAt: isoDate,
})

export const projectListResponseSchema = z.object({
  data: projectResponseSchema.array(),
  total: z.int().nonnegative(),
  ...commonSchema,
})

export const addProjectMemberSchema = z.object({
  userId: z.number().int().min(1),
  role: z.enum($Enums.ProjectMemberRole).default("MEMBER"),
})

export const projectMemberSchema = z.object({
  userId: z.number().int().min(1),
  name: z.string(),
  email: z.email(),
  role: z.enum($Enums.ProjectMemberRole),
})

export const projectMemberListSchema = z.object({
  data: projectMemberSchema.array(),
  total: z.int().nonnegative(),
})
