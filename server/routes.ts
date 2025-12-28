import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlanSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/plans", async (_req, res) => {
    const plans = await storage.getPlans();
    res.json(plans);
  });

  app.get("/api/plans/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const plan = await storage.getPlan(id);
    if (!plan) return res.status(404).json({ error: "Plan not found" });

    res.json(plan);
  });

  app.post("/api/plans", async (req, res) => {
    const parsed = insertPlanSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error });
    }
    const plan = await storage.createPlan(parsed.data);
    res.json(plan);
  });

  app.put("/api/plans/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const plan = await storage.updatePlan(id, req.body);
    res.json(plan);
  });

  const httpServer = createServer(app);
  return httpServer;
}
