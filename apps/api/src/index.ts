import { Hono } from "hono";
import { HTTP_STATUS_CODE } from "@xchange/config";
import { ERROR_CODE, LoggerFactory, LoggerService } from "@xchange/shared";
import { rateLimiter } from "hono-rate-limiter";
import { createErrorHandler, notFoundHandler } from "./error";
import { RequestResponseLoggerMiddleware } from "./middleware";

const app = new Hono();
const port = Number(process.env.PORT ?? 3000);

const logger = new LoggerService(
  new LoggerFactory().create({
    serviceName: "api",
    env: process.env.NODE_ENV === "production" ? "production" : "development",
    level: "info",
  }),
);

const requestResponseLoggerMiddleware = new RequestResponseLoggerMiddleware(
  logger,
);

app.use("*", requestResponseLoggerMiddleware.handle);
app.use(
  "*",
  rateLimiter({
    windowMs: 60_000,
    limit: 100,
    standardHeaders: "draft-6",
    keyGenerator: (c) => {
      const forwardedFor = c.req.header("x-forwarded-for");
      return forwardedFor?.split(",")[0]?.trim() || "unknown";
    },
    statusCode: 429,
    handler: (c) => {
      c.json(
        {
          success: false,
          requestId: c.req.header("x-request-id"),
          error: {
            code: ERROR_CODE.rateLimited,
            message: "Too many requests",
          },
        },
        HTTP_STATUS_CODE.tooManyRequests,
      );
    },
  }),
);

app.get("/", (c) => {
  return c.json(
    {
      message: "xchange api",
    },
    HTTP_STATUS_CODE.ok,
  );
});

app.notFound(notFoundHandler);
app.onError(createErrorHandler(logger));

if (import.meta.main) {
  Bun.serve({
    fetch: app.fetch,
    port,
  });
  logger.info("api.started", { port });
}
