import { ERROR_CODE } from "@xchange/shared";
import { HTTP_STATUS_CODE } from "@xchange/config";
import type { Context } from "hono";

export const notFoundHandler = (c: Context) => {
  const requestId = c.req.header("x-request-id");

  return c.json(
    {
      success: false,
      requestId,
      error: {
        code: ERROR_CODE.notFound,
        message: "Route not found",
      },
    },
    HTTP_STATUS_CODE.notFound,
  );
};
