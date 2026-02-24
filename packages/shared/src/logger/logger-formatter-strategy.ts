import type { Format } from "logform";
export interface LoggerFormatterStrategy {
  create(): Format;
}
