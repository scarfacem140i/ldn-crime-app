import {
  pgTable,
  text,
  integer,
  timestamp,
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";

import { user } from "./auth-schema";
import { relations } from "drizzle-orm";

export const crime_report = pgTable("crime_report", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  description: text("description"),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  street_name: text("street_name"),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  verified: boolean("verified").notNull().default(false),
});

export const api_crime_report = pgTable("api_crime_report", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  street_name: text("street_name").notNull(),
  month: timestamp("month").notNull(),
  outcome_status: text("outcome_status"),
  context: text("context"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  verified: boolean("verified").notNull().default(false),
});

export const api_report_count = pgTable("api_report_count", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  month: timestamp("date").notNull(),
  count: integer("count").notNull(),
});

export const tracked_postcode = pgTable("tracked_postcode", {
  id: text("id").primaryKey(),
  postcode: text("postcode").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const crime_vote = pgTable(
  "crime_vote",
  {
    crime_id: text("crime_id")
      .notNull()
      .references(() => crime_report.id, { onDelete: "cascade" }),
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    vote: integer("vote").notNull(), // 1 for upvote, -1 for downvote
  },
  (table) => ({
    pk: primaryKey({ columns: [table.crime_id, table.user_id] }),
  })
);

export const crime_flag = pgTable(
  "crime_flag",
  {
    crime_id: text("crime_id")
      .notNull()
      .references(() => crime_report.id, { onDelete: "cascade" }),
    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.crime_id, table.user_id] }),
  })
);

export const crimeReportRelations = relations(
  crime_report,
  ({ many, one }) => ({
    votes: many(crime_vote),
    flags: many(crime_flag),
    user: one(user, {
      fields: [crime_report.user_id],
      references: [user.id],
    }),
  })
);

export const crimeVoteRelations = relations(crime_vote, ({ one }) => ({
  crime: one(crime_report, {
    fields: [crime_vote.crime_id],
    references: [crime_report.id],
  }),
  user: one(user, {
    fields: [crime_vote.user_id],
    references: [user.id],
  }),
}));

export const crimeFlagRelations = relations(crime_flag, ({ one }) => ({
  crime: one(crime_report, {
    fields: [crime_flag.crime_id],
    references: [crime_report.id],
  }),
  user: one(user, {
    fields: [crime_flag.user_id],
    references: [user.id],
  }),
}));
