import { relations } from "drizzle-orm";
import { usersTable } from "../tables/users.table";
import { sessionTable } from "../tables/sessions.table";
import { refreshTokenFamiliesTable } from "../tables/refresh-token-families.table";
import { refreshTokensTable } from "../tables/refresh-tokens.table";
import { emailVerificationTokensTable } from "../tables/email-verification-tokens.table";
import { passwordResetTokensTable } from "../tables/password-reset-tokens.table";
import { securityEventsTable } from "../tables/security-events.table";

export const userRelations = relations(usersTable, ({ many }) => ({
  sessions: many(sessionTable),
  refreshTokenFamilies: many(refreshTokenFamiliesTable),
  refreshTokens: many(refreshTokensTable),
  emailVerificationTokensTable: many(emailVerificationTokensTable),
  passwordResetTokens: many(passwordResetTokensTable),
  securityEvents: many(securityEventsTable),
}));

export const sessionsRelations = relations(sessionTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [sessionTable.userId],
    references: [usersTable.id],
  }),
  families: many(refreshTokenFamiliesTable),
  refreshTokens: many(refreshTokensTable),
  securityEvents: many(securityEventsTable),
}));

export const refreshTokenFamiliesRelations = relations(
  refreshTokenFamiliesTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [refreshTokenFamiliesTable.userId],
      references: [usersTable.id],
    }),
    session: one(sessionTable, {
      fields: [refreshTokenFamiliesTable.sessionId],
      references: [sessionTable.id],
    }),
    refreshTokens: many(refreshTokensTable),
    securityEvents: many(securityEventsTable),
  }),
);

export const refreshTokensRelations = relations(
  refreshTokensTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [refreshTokensTable.userId],
      references: [usersTable.id],
    }),
    session: one(sessionTable, {
      fields: [refreshTokensTable.sessionId],
      references: [sessionTable.id],
    }),
    family: one(refreshTokenFamiliesTable, {
      fields: [refreshTokensTable.familyId],
      references: [refreshTokenFamiliesTable.id],
    }),
    parent: one(refreshTokensTable, {
      fields: [refreshTokensTable.parentId],
      references: [refreshTokensTable.id],
      relationName: "refresh_token_parent",
    }),
    replacedBy: one(refreshTokensTable, {
      fields: [refreshTokensTable.replacedById],
      references: [refreshTokensTable.id],
      relationName: "refresh_token_replaced_by",
    }),
  }),
);

export const emailVerificationTokenRelations = relations(
  emailVerificationTokensTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [emailVerificationTokensTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const passwordResetTokensRelations = relations(
  passwordResetTokensTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [passwordResetTokensTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const securityEventsRelations = relations(
  securityEventsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [securityEventsTable.userId],
      references: [usersTable.id],
    }),
    session: one(sessionTable, {
      fields: [securityEventsTable.sessionId],
      references: [sessionTable.id],
    }),
    family: one(refreshTokenFamiliesTable, {
      fields: [securityEventsTable.familyId],
      references: [refreshTokenFamiliesTable.id],
    }),
  }),
);
