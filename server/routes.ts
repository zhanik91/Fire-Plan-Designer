import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlanSchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/plans", async (req, res) => {
    // If not authenticated, return empty or 401?
    // Let's return public plans or user's plans if logged in.
    const userId = req.isAuthenticated() ? (req.user as any).id : undefined;
    const plans = await storage.getPlans(userId);
    res.json(plans);
  });

  app.get("/api/plans/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const plan = await storage.getPlan(id);
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    // Optional: Check ownership
    // if (plan.userId && plan.userId !== req.user.id) return 403

    res.json(plan);
  });

  app.post("/api/plans", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

    const parsed = insertPlanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }

    const planData = { ...parsed.data, userId: (req.user as any).id };
    const plan = await storage.createPlan(planData);
    res.json(plan);
  });

  app.put("/api/plans/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });

    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const plan = await storage.updatePlan(id, req.body);
    res.json(plan);
  });

  app.delete("/api/plans/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Unauthorized" });
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    await storage.deletePlan(id);
    res.sendStatus(204);
  });

  const httpServer = createServer(app);
  return httpServer;
}
