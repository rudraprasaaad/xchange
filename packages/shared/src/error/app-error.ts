import type { ErrorCode } from "./error-code";
import type { HttpStatusCode } from "@xchange/config";

export type AppErrorOptions = {
  statusCode: HttpStatusCode;
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
};

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = "AppError";
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.details = options.details;
  }
}
