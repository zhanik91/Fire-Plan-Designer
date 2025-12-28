import { plans, type Plan, type InsertPlan } from "@shared/schema";

export interface IStorage {
  createPlan(plan: InsertPlan): Promise<Plan>;
  getPlan(id: number): Promise<Plan | undefined>;
  getPlans(): Promise<Plan[]>;
  updatePlan(id: number, plan: Partial<InsertPlan>): Promise<Plan>;
  deletePlan(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private plans: Map<number, Plan>;
  private currentId: number;

  constructor() {
    this.plans = new Map();
    this.currentId = 1;
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const id = this.currentId++;
    const plan: Plan = { ...insertPlan, id, textPart: insertPlan.textPart || null, createdAt: new Date().toISOString() };
    this.plans.set(id, plan);
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
    return updated;
  }

  async deletePlan(id: number): Promise<void> {
    this.plans.delete(id);
  }
}

export const storage = new MemStorage();
