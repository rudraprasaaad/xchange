import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { sessionTable } from "./sessions.table";
import { usersTable } from "./users.table";
import { authTokenFamilyStatusEnum } from "../enums/auth.enums";

export const refreshTokenFamiliesTable = pgTable(
  "refresh_token_families",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessionTable.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    status: authTokenFamilyStatusEnum("status").default("HEALTHY").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    compromisedAt: timestamp("compromised_at", { withTimezone: true }),
    compromiseReason: text("compromise_reason"),
  },
  (table) => [
    index("refresh_token_families_session_status_idx").on(
      table.sessionId,
      table.status,
    ),
  ],
);

export type RefreshTokenFamily = typeof refreshTokenFamiliesTable.$inferSelect;
export type NewRefreshTokenFamily =
  typeof refreshTokenFamiliesTable.$inferInsert;
