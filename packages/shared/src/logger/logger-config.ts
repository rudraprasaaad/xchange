export type LoggerEnv = "development" | "test" | "production";
export type LoggerLevel =
  | "error"
  | "warn"
  | "info"
  | "http"
  | "verbose"
  | "debug"
  | "silly";

export interface LoggerConfig {
  serviceName: string;
  level?: LoggerLevel;
  env?: LoggerEnv;
}
