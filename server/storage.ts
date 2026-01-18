import { plans, type Plan, type InsertPlan } from "@shared/schema";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  createPlan(plan: InsertPlan): Promise<Plan>;
  getPlan(id: number): Promise<Plan | undefined>;
  getPlans(): Promise<Plan[]>;
  updatePlan(id: number, plan: Partial<InsertPlan>): Promise<Plan>;
  deletePlan(id: number): Promise<void>;
}

export class FileStorage implements IStorage {
  private plans: Map<number, Plan>;
  private currentId: number;
  private filePath: string;

  constructor() {
    this.plans = new Map();
    this.currentId = 1;
    this.filePath = path.join(process.cwd(), "data", "plans.json");
    this.init();
  }

  private async init() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        this.plans = new Map(parsed.map((p: Plan) => [p.id, p]));
        this.currentId = parsed.length > 0 ? Math.max(...parsed.map((p: Plan) => p.id)) + 1 : 1;
      }
    } catch (e) {
      // File doesn't exist or is invalid, start with empty
      await this.save();
    }
  }

  private async save() {
    const data = Array.from(this.plans.values());
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const id = this.currentId++;
    const plan: Plan = {
        ...insertPlan,
        id,
        textPart: insertPlan.textPart || null,
        createdAt: new Date().toISOString()
    };
    this.plans.set(id, plan);
    await this.save();
    return plan;
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    return this.plans.get(id);
  }

  async getPlans(): Promise<Plan[]> {
    return Array.from(this.plans.values());
  }

  async updatePlan(id: number, update: Partial<InsertPlan>): Promise<Plan> {
    const existing = await this.getPlan(id);
    if (!existing) throw new Error("Plan not found");
    const updated = { ...existing, ...update };
    this.plans.set(id, updated);
    await this.save();
    return updated;
  }

  async deletePlan(id: number): Promise<void> {
    this.plans.delete(id);
    await this.save();
  }
}

export const storage = new FileStorage();
