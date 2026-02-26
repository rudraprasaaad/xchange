import {
  integer,
  pgTable,
  uuid,
  timestamp,
  text,
  inet,
  index,
  check,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users.table";
import { authSessionStatusEnum } from "../enums/auth.enums";
import { sql } from "drizzle-orm";

export const sessionTable = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    status: authSessionStatusEnum("status").default("ACTIVE").notNull(),
    sessionVersion: integer("session_version").default(1).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    idleExpiresAt: timestamp("idle_expires_at", {
      withTimezone: true,
    }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    revokeReason: text("revoke_reason"),
    ipFirst: inet("ip_first"),
    ipLast: inet("ip_last"),
    uaFirst: text("ua_first"),
    uaLast: text("ua_last"),
  },
  (table) => [
    index("session_user_status_idx").on(table.userId, table.status),
    index("sessions_expires_at_idx").on(table.expiresAt),
    index("sessions_idle_expires_at_idx").on(table.idleExpiresAt),
    check("sessions_version_positive_chk", sql`${table.sessionVersion} >= 1`),
  ],
);

export type Session = typeof sessionTable.$inferSelect;
export type NewSession = typeof sessionTable.$inferInsert;
