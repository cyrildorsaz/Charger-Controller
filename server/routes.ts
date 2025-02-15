import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertScheduleSchema } from "@shared/schema";
import { TeslaClient } from "../client/src/lib/tesla";

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);
  
  // Tesla Auth
  app.post("/api/auth/tesla", async (req, res) => {
    const { code } = req.body;
    try {
      const tesla = new TeslaClient();
      const tokens = await tesla.exchangeCodeForTokens(code);
      await storage.saveCredentials({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
      });
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to authenticate with Tesla" });
    }
  });

  // Vehicle Status
  app.get("/api/vehicle/status", async (req, res) => {
    try {
      const creds = await storage.getCredentials();
      if (!creds) throw new Error("Not authenticated");

      const tesla = new TeslaClient(creds.accessToken);
      const status = await tesla.getVehicleStatus();
      res.json(status);
    } catch (error) {
      res.status(401).json({ message: "Failed to get vehicle status" });
    }
  });

  // Charging Schedules
  app.get("/api/schedules", async (req, res) => {
    const schedules = await storage.getSchedules();
    res.json(schedules);
  });

  app.post("/api/schedules", async (req, res) => {
    const parsed = insertScheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid schedule data" });
    }
    const schedule = await storage.createSchedule(parsed.data);
    res.json(schedule);
  });

  app.patch("/api/schedules/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const parsed = insertScheduleSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid schedule data" });
    }
    try {
      const schedule = await storage.updateSchedule(id, parsed.data);
      res.json(schedule);
    } catch (error) {
      res.status(404).json({ message: "Schedule not found" });
    }
  });

  app.delete("/api/schedules/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteSchedule(id);
    res.status(204).end();
  });

  return httpServer;
}
