import z from "zod/v4";
import { isoDate } from "@common/helpers/schema";
import { tagFields, tagSummarySchema } from "@modules/tags/schema/tags.schema";

export const postResponseSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  createdAt: isoDate,
  updatedAt: isoDate,
  description: z.string().nullable(),
  userId: z.number().int().positive(),
});

export const listPostQuerySchema = z.object({
  tag: tagFields.name.optional(),
});

export const replacePostTagsSchema = z.object({
  tagIds: tagFields.id.array().max(20),
});

export const postWithRelationsSchema = postResponseSchema.omit({ userId: true }).extend({
  poster: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    email: z.email(),
    role: z.string(),
    isActive: z.boolean(),
  }),
  tags: tagSummarySchema.array(),
});

export const postListResponseSchema = postWithRelationsSchema.array();
