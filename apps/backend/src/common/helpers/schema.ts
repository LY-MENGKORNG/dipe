import { z } from "zod/v4"

export const commonSchema = {
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };

  for (const key of keys) {
    delete result[key];
  }

  return result as Omit<T, K>;
}
