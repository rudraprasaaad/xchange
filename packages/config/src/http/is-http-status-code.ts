import { HTTP_STATUS_CODE } from "./http-status-code";
import type { HttpStatusCode } from "./http-status-code-type";

const statusCodeSet = new Set<number>(Object.values(HTTP_STATUS_CODE));

export const isHttpStatusCode = (value: number): value is HttpStatusCode => {
  return statusCodeSet.has(value);
};
