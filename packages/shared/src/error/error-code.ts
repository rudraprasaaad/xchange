export const ERROR_CODE = {
  badRequest: "BAD_REQUEST",
  unauthorized: "UNAUTHORIZED",
  forbidden: "FORBIDDEN",
  notFound: "NOT_FOUND",
  conflict: "CONFLICT",
  validationError: "VALIDATION_ERROR",
  internalServerError: "INTERNAL_SERVER_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODE)[keyof typeof ERROR_CODE];
