import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const teslaCredentials = pgTable("tesla_credentials", {
  id: serial("id").primaryKey(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const chargingSchedules = pgTable("charging_schedules", {
  id: serial("id").primaryKey(),
  startTime: text("start_time").notNull(), // HH:mm format
  endTime: text("end_time").notNull(), // HH:mm format
  targetPercentage: integer("target_percentage").notNull(),
  enabled: integer("enabled").notNull().default(1),
});

export const insertCredentialsSchema = createInsertSchema(teslaCredentials);
export const insertScheduleSchema = createInsertSchema(chargingSchedules).pick({
  startTime: true,
  endTime: true,
  targetPercentage: true,
  enabled: true,
});

export type InsertCredentials = z.infer<typeof insertCredentialsSchema>;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type TeslaCredentials = typeof teslaCredentials.$inferSelect;
export type ChargingSchedule = typeof chargingSchedules.$inferSelect;

export interface VehicleStatus {
  batteryLevel: number;
  chargingState: string;
  timeToFullCharge: number;
  chargeLimit: number;
}
