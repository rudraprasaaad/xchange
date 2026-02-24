import { ERROR_CODE } from "@xchange/shared";
import type { Context } from "hono";

export const notFoundHandler = (c: Context) => {
  const requestId = c.req.header("x-request-id");

  return c.json({
    success: false,
    requestId,
    error: {
      code: ERROR_CODE.notFound,
      message: "Route not found",
    },
  });
};
