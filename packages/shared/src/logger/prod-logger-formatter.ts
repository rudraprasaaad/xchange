import { format } from "winston";
import type { LoggerFormatterStrategy } from "./logger-formatter-strategy";

export class ProdLoggerFormatter implements LoggerFormatterStrategy {
  create() {
    return format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.json(),
    );
  }
}
