import {
  pgTable,
  uuid,
  timestamp,
  text,
  inet,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users.table";
import { sessionTable } from "./sessions.table";
import { refreshTokenFamiliesTable } from "./refresh-token-families.table";
import { authEventSeverityEnum } from "../enums/auth.enums";

export const securityEventsTable = pgTable(
  "security_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    occuredAt: timestamp("occured_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    userId: uuid("user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    sessionId: uuid("session_id").references(() => sessionTable.id, {
      onDelete: "set null",
    }),
    familyId: uuid("family_id").references(() => refreshTokenFamiliesTable.id, {
      onDelete: "set null",
    }),
    eventType: text("event_type").notNull(),
    severity: authEventSeverityEnum("severity").default("INFO").notNull(),

    ip: inet("ip"),
    userAgent: text("user_agent"),
    requestId: text("request_id"),
  },
  (table) => [
    index("security_events_user_occured_at_idx").on(
      table.userId,
      table.occuredAt,
    ),
    index("security_events_type_occured_at_idx").on(
      table.eventType,
      table.occuredAt,
    ),
  ],
);

export type SecurityEvent = typeof securityEventsTable.$inferSelect;
export type NewSecurityEvent = typeof securityEventsTable.$inferInsert;
