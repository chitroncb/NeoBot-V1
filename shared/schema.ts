import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const botUsers = pgTable("bot_users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  xp: integer("xp").default(0),
  level: integer("level").default(1),
  birthday: text("birthday"),
  relationship: text("relationship"),
  verified: boolean("verified").default(false),
  banned: boolean("banned").default(false),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const threads = pgTable("threads", {
  id: serial("id").primaryKey(),
  threadId: text("thread_id").notNull().unique(),
  name: text("name").notNull(),
  emoji: text("emoji"),
  memberCount: integer("member_count").default(0),
  messagesCount: integer("messages_count").default(0),
  welcomeMessage: text("welcome_message"),
  prefix: text("prefix").default("/"),
  autoModeration: boolean("auto_moderation").default(false),
  banned: boolean("banned").default(false),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const commands = pgTable("commands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  usage: text("usage"),
  category: text("category").default("general"),
  cooldown: integer("cooldown").default(0),
  role: integer("role").default(0),
  enabled: boolean("enabled").default(true),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const commandLogs = pgTable("command_logs", {
  id: serial("id").primaryKey(),
  commandName: text("command_name").notNull(),
  userId: text("user_id").notNull(),
  threadId: text("thread_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  success: boolean("success").default(true),
  error: text("error"),
});

export const botStats = pgTable("bot_stats", {
  id: serial("id").primaryKey(),
  activeThreads: integer("active_threads").default(0),
  totalUsers: integer("total_users").default(0),
  commandsUsed: integer("commands_used").default(0),
  uptime: text("uptime").default("0%"),
  messagesProcessed: integer("messages_processed").default(0),
  date: text("date").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertBotUserSchema = createInsertSchema(botUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertThreadSchema = createInsertSchema(threads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommandSchema = createInsertSchema(commands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommandLogSchema = createInsertSchema(commandLogs).omit({
  id: true,
  timestamp: true,
});

export const insertBotStatsSchema = createInsertSchema(botStats).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type BotUser = typeof botUsers.$inferSelect;
export type Thread = typeof threads.$inferSelect;
export type Command = typeof commands.$inferSelect;
export type CommandLog = typeof commandLogs.$inferSelect;
export type BotStats = typeof botStats.$inferSelect;
export type InsertBotUser = z.infer<typeof insertBotUserSchema>;
export type InsertThread = z.infer<typeof insertThreadSchema>;
export type InsertCommand = z.infer<typeof insertCommandSchema>;
export type InsertCommandLog = z.infer<typeof insertCommandLogSchema>;
export type InsertBotStats = z.infer<typeof insertBotStatsSchema>;
