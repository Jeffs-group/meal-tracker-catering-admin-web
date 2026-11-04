import { z } from "zod";

/**
 * Reusable primitive validation schemas
 */
export const requiredString = (fieldName: string, min = 1) =>
  z
    .string({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} must be a string`,
    })
    .trim()
    .min(min, `${fieldName} must be at least ${min} character(s)`);

export const emailSchema = z
  .string({
    required_error: "Email is required",
  })
  .trim()
  .min(1, "Email is required")
  .email("Invalid email address");

export const passwordSchema = z
  .string({
    required_error: "Password is required",
  })
  .min(8, "Password must be at least 8 characters long");

export const idSchema = z
  .string({
    required_error: "Identifier is required",
  })
  .trim()
  .min(1, "Identifier cannot be empty");

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  search: z.string().trim().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
