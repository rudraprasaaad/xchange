import { z } from "zod";
export const errorDetailSchema = z.record(z.string(), z.unknown());

export const errorBodySchema = z.object({
  code: z.string(),
  message: z.string(),
  details: errorDetailSchema.optional(),
});

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: errorBodySchema,
  requestId: z.string().optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
