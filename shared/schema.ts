import { pgTable, text, serial, integer, boolean, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  profilePicture: text("profile_picture"),
  plan: text("plan").default("Free").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  profilePicture: true,
  plan: true,
});

// Review table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  reviewerName: text("reviewer_name").notNull(),
  platform: text("platform").notNull(), // e.g., "Google", "Yelp"
  rating: real("rating").notNull(), // 1-5 rating
  reviewText: text("review_text").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  isResolved: boolean("is_resolved").default(false).notNull(),
  response: text("response"),
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  userId: true,
  reviewerName: true,
  platform: true,
  rating: true, 
  reviewText: true,
  date: true,
  isResolved: true,
  response: true,
});

// Metrics table for storing aggregated metrics
export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  averageRating: real("average_rating"), 
  totalReviews: integer("total_reviews"),
  positivePercentage: real("positive_percentage"),
  keywordTrends: jsonb("keyword_trends"), // JSON data for keyword trends
});

export const insertMetricsSchema = createInsertSchema(metrics).pick({
  userId: true,
  date: true,
  averageRating: true, 
  totalReviews: true,
  positivePercentage: true,
  keywordTrends: true,
});

// Alerts table
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  alertType: text("alert_type").notNull(), // e.g., "negative_review", "keyword_trend"
  content: text("content").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  isRead: boolean("is_read").default(false).notNull(),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  userId: true,
  alertType: true,
  content: true,
  date: true,
  isRead: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertMetrics = z.infer<typeof insertMetricsSchema>;
export type Metrics = typeof metrics.$inferSelect;

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
