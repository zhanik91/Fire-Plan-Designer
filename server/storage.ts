import { plans, users, type Plan, type InsertPlan, type User, type InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createPlan(plan: InsertPlan): Promise<Plan>;
  getPlan(id: number): Promise<Plan | undefined>;
  getPlans(userId?: number): Promise<Plan[]>;
  updatePlan(id: number, plan: Partial<InsertPlan>): Promise<Plan>;
  deletePlan(id: number): Promise<void>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private plans: Map<number, Plan>;
  private currentUserId: number;
  private currentPlanId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.plans = new Map();
    this.currentUserId = 1;
    this.currentPlanId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
        ...insertUser,
        id,
        level: insertUser.level || null,
        region: insertUser.region || null,
        unit: insertUser.unit || null,
        role: insertUser.role || "USER"
    };
    this.users.set(id, user);
    return user;
  }

  async createPlan(insertPlan: InsertPlan): Promise<Plan> {
    const id = this.currentPlanId++;
    const plan: Plan = { ...insertPlan, id, userId: insertPlan.userId || null, textPart: insertPlan.textPart || null, createdAt: new Date().toISOString() };
    this.plans.set(id, plan);
    return plan;
  }

  async getPlan(id: number): Promise<Plan | undefined> {
    return this.plans.get(id);
  }

  async getPlans(userId?: number): Promise<Plan[]> {
    const allPlans = Array.from(this.plans.values());
    if (userId) {
        return allPlans.filter(p => p.userId === userId || p.userId === null); // Show public? Or just user's.
    }
    return allPlans;
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
