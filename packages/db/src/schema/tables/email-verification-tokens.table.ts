import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { usersTable } from "./users.table";

export const emailVerificationTokensTable = pgTable(
  "email_verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("email_verification_tokens_token_hash_uq").on(table.tokenHash),
    index("email_verification_tokens_user_expires_idx").on(
      table.userId,
      table.expiresAt,
    ),
  ],
);

export type EmailVerificationToken =
  typeof emailVerificationTokensTable.$inferSelect;
export type NewEmailVerificationToken =
  typeof emailVerificationTokensTable.$inferInsert;
