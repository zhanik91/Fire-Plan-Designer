import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: jsonb("content").notNull(),
  textPart: jsonb("text_part"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertPlanSchema = createInsertSchema(plans);

export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type Plan = typeof plans.$inferSelect;
