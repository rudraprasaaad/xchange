import { toErrorResponse, type LoggerService } from "@xchange/shared";
import type { Context } from "hono";

export const createErrorHandler =
  (logger: LoggerService) => (error: unknown, c: Context) => {
    const requestId = c.req.header("x-request-id");
    const isProd = process.env.NODE_ENV === "production";

    const { statusCode, body } = toErrorResponse({
      error,
      requestId,
      exposeDetails: !isProd,
    });

    logger.error("request.error", {
      requestId,
      path: c.req.path,
      method: c.req.method,
      statusCode,
      error: error instanceof Error ? error.message : String(error),
    });

    c.status(statusCode);
    return c.json(body);
  };
