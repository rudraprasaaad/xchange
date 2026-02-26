import {
  foreignKey,
  index,
  inet,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { refreshTokenFamiliesTable } from "./refresh-token-families.table";
import { sessionTable } from "./sessions.table";
import { usersTable } from "./users.table";
import { authRefreshTokenStatusEnum } from "../enums/auth.enums";

export const refreshTokensTable = pgTable(
  "refresh_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    familyId: uuid("family_id")
      .notNull()
      .references(() => refreshTokenFamiliesTable.id, { onDelete: "cascade" }),

    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessionTable.id, { onDelete: "cascade" }),

    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    parentId: uuid("parent_id"),

    replacedById: uuid("replaced_by_id"),

    tokenHash: text("token_hash").notNull(),
    status: authRefreshTokenStatusEnum("status").default("ISSUED").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),

    createdIp: inet("created_ip"),
    createdUa: text("created_ua"),
  },
  (table) => [
    uniqueIndex("refresh_tokens_token_hash_uq").on(table.tokenHash),
    index("refresh_tokens_family_status_idx").on(table.familyId, table.status),
    index("refresh_tokens_session_status_idx").on(
      table.sessionId,
      table.status,
    ),
    index("refresh_tokens_expires_at_idx").on(table.expiresAt),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "refresh_tokens_parent_id_fk",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.replacedById],
      foreignColumns: [table.id],
      name: "refresh_tokens_replaced_by_id_fk",
    }).onDelete("set null"),
  ],
);

export type RefreshToken = typeof refreshTokensTable.$inferSelect;
export type NewRefreshToken = typeof refreshTokensTable.$inferInsert;
