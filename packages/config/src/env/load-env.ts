import { parse } from "zod";
import { envSchema } from "./env-schema";
import type { Env } from "./env-type";

export const loadEnv = (
  source: Record<string, string | undefined> = process.env,
): Env => {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success)
    throw new Error(`Invalide environment variables: ${parsed.error.message}`);

  return parsed.data;
};
