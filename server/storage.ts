import { type TeslaCredentials, type ChargingSchedule, type InsertCredentials, type InsertSchedule } from "@shared/schema";

export interface IStorage {
  getCredentials(): Promise<TeslaCredentials | undefined>;
  saveCredentials(creds: InsertCredentials): Promise<TeslaCredentials>;
  getSchedules(): Promise<ChargingSchedule[]>;
  createSchedule(schedule: InsertSchedule): Promise<ChargingSchedule>;
  updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<ChargingSchedule>;
  deleteSchedule(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private credentials: TeslaCredentials | undefined;
  private schedules: Map<number, ChargingSchedule>;
  private currentId: number;

  constructor() {
    this.schedules = new Map();
    this.currentId = 1;
  }

  async getCredentials(): Promise<TeslaCredentials | undefined> {
    return this.credentials;
  }

  async saveCredentials(creds: InsertCredentials): Promise<TeslaCredentials> {
    this.credentials = { id: 1, ...creds };
    return this.credentials;
  }

  async getSchedules(): Promise<ChargingSchedule[]> {
    return Array.from(this.schedules.values());
  }

  async createSchedule(schedule: InsertSchedule): Promise<ChargingSchedule> {
    const id = this.currentId++;
    const newSchedule = { id, ...schedule };
    this.schedules.set(id, newSchedule);
    return newSchedule;
  }

  async updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<ChargingSchedule> {
    const existing = this.schedules.get(id);
    if (!existing) throw new Error("Schedule not found");
    
    const updated = { ...existing, ...schedule };
    this.schedules.set(id, updated);
    return updated;
  }

  async deleteSchedule(id: number): Promise<void> {
    this.schedules.delete(id);
  }
}

export const storage = new MemStorage();
