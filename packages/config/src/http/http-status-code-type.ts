import { HTTP_STATUS_CODE } from "./http-status-code";

export type HttpStatusCode =
  (typeof HTTP_STATUS_CODE)[keyof typeof HTTP_STATUS_CODE];
