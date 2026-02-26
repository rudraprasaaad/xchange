import { pgEnum } from "drizzle-orm/pg-core";

export const authUserRoleEnum = pgEnum("auth_user_role", ["USER", "ADMIN"]);

export const authUserStatusEnum = pgEnum("auth_user_status", [
  "ACTIVE",
  "LOCKED",
  "DISABLED",
]);

export const authSessionStatusEnum = pgEnum("auth_session_status", [
  "ACTIVE",
  "REVOKED",
  "EXPIRED",
]);

export const authRefreshTokenStatusEnum = pgEnum("auth_refresh_token_status", [
  "ISSUED",
  "USED",
  "REVOKED",
  "EXPIRED",
  "ACTIVE",
  "REVOKED",
  "EXPIRED",
]);

export const authTokenFamilyStatusEnum = pgEnum("auth_token_family_status", [
  "HEALTHY",
  "COMPROMISED",
  "REVOKED",
]);

export const authEventSeverityEnum = pgEnum("auth_event_severity", [
  "INFO",
  "WARN",
  "HIGH",
  "CRITICAL",
]);
