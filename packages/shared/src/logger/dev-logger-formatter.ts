import { format } from "winston";
import type { LoggerFormatterStrategy } from "./logger-formatter-strategy";
import type { TransformableInfo } from "logform";

export class DevLoggerFormatter implements LoggerFormatterStrategy {
  create() {
    return format.combine(
      format.colorize(),
      format.timestamp(),
      format.errors({ stack: true }),
      format.printf((info: TransformableInfo) => {
        const level = String(info.level);
        const message = String(info.message);
        const timestamp = String(info.timestamp ?? "");
        const service = String(info.service ?? "app");
        const stack = info.stack ? String(info.stack) : undefined;

        const base = `${timestamp} [${service}] ${level}: ${message}`;
        return stack ? `${base}\n${stack}` : base;
      }),
    );
  }
}
