import { AppError } from "./app-error";
import { ERROR_CODE } from "./error-code";
import type { ErrorResponse } from "./error-response-schema";
import { HTTP_STATUS_CODE, type HttpStatusCode } from "@xchange/config";

type NormalizeInput = {
  error: unknown;
  requestId?: string;
  exposeDetails?: boolean;
};

export const toErrorResponse = (
  input: NormalizeInput,
): {
  statusCode: HttpStatusCode;
  body: ErrorResponse;
} => {
  const { error, requestId, exposeDetails = false } = input;

  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: {
        success: false,
        requestId,
        error: {
          code: error.code,
          message: error.message,
          details: exposeDetails ? error.details : undefined,
        },
      },
    };
  }

  return {
    statusCode: HTTP_STATUS_CODE.internalServerError,
    body: {
      success: false,
      requestId,
      error: {
        code: ERROR_CODE.internalServerError,
        message: "Internal Server Error",
      },
    },
  };
};
