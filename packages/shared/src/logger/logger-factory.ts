import { createLogger, transports, type Logger } from "winston";
import { DevLoggerFormatter } from "./dev-logger-formatter";
import type { LoggerConfig } from "./logger-config";
import type { LoggerFormatterStrategy } from "./logger-formatter-strategy";
import { ProdLoggerFormatter } from "./prod-logger-formatter";

export class LoggerFactory {
  private resolveFormatter(env: LoggerConfig["env"]): LoggerFormatterStrategy {
    return env === "production"
      ? new ProdLoggerFormatter()
      : new DevLoggerFormatter();
  }

  create(config: LoggerConfig): Logger {
    const env =
      config.env ??
      (process.env.NODE_ENV as LoggerConfig["env"]) ??
      "development";
    const formatter = this.resolveFormatter(env);

    return createLogger({
      level: config.level ?? "info",
      defaultMeta: { service: config.serviceName },
      format: formatter.create(),
      transports: [new transports.Console()],
    });
  }
}
