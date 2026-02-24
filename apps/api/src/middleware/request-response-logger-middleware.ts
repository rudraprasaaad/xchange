import { LoggerService } from "@xchange/shared";
import type { MiddlewareHandler } from "hono";
export class RequestResponseLoggerMiddleware {
  constructor(private readonly logger: LoggerService) {}

  handle: MiddlewareHandler = async (c, next) => {
    const startedAt = Date.now();
    const requestId = c.req.header("x-request-id") ?? crypto.randomUUID();
    const method = c.req.method;
    const path = c.req.path;

    this.logger.info("request.started", {
      requestId,
      method,
      path,
    });

    let error: unknown;

    try {
      await next();
    } catch (err) {
      error = err;
      throw err;
    } finally {
      const durationMs = Date.now() - startedAt;
      const status = c.res.status;

      c.header("x-request-id", requestId);

      if (error) {
        this.logger.error("request.failed", {
          requestId,
          method,
          path,
          status,
          durationMs,
          error: error instanceof Error ? error.message : String(error),
        });
      } else {
        this.logger.info("request.completed", {
          requestId,
          method,
          path,
          status,
          durationMs,
        });
      }
    }
  };
}
