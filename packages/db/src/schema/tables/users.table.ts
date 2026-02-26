import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  uniqueIndex,
  index,
  check,
} from "drizzle-orm/pg-core";
import { authUserRoleEnum, authUserStatusEnum } from "../enums/auth.enums";
import { sql } from "drizzle-orm";

export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),

    role: authUserRoleEnum("role").default("USER").notNull(),
    status: authUserStatusEnum("status").default("ACTIVE").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),

    failedLoginCount: integer("failed_login_count").default(0).notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),

    authVersion: integer("auth_version").default(1).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updateAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_email_uq").on(table.email),
    index("users_status_locked_until_idx").on(table.status, table.lockedUntil),
    check(
      "users_failed_login_count_non_negative_chk",
      sql`${table.failedLoginCount} >= 0`,
    ),
    check("users_auth_version_positive_chk", sql`${table.authVersion} >= 1`),
  ],
);

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
