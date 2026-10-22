import { z } from "zod/v4";
import { isoDate } from "@common/helpers/schema";

export const tagFields = {
  id: z.number().int().positive(),
  name: z.string().trim().toLowerCase().min(1).max(40),
} as const;

export const createTagSchema = z.object({ name: tagFields.name });

export const tagSummarySchema = z.object({
  id: tagFields.id,
  name: z.string(),
});

export const tagResponseSchema = tagSummarySchema.extend({
  createdAt: isoDate,
});

export const tagListResponseSchema = tagResponseSchema
  .extend({ postCount: z.int().nonnegative() })
  .array();
