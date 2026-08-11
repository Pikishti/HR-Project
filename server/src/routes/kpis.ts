import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler } from "../asyncHandler.js";

export const kpiSetsRouter = Router();
export const kpisRouter = Router();
export const goalsRouter = Router();

const kpiSetInput = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

kpiSetsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const sets = await prisma.kpiSet.findMany({
      orderBy: { createdAt: "desc" },
      include: { kpis: { include: { person: true } } },
    });
    res.json(sets);
  })
);

kpiSetsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = kpiSetInput.parse(req.body);
    const set = await prisma.kpiSet.create({ data });
    res.status(201).json(set);
  })
);

kpiSetsRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = kpiSetInput.partial().parse(req.body);
    const set = await prisma.kpiSet.update({ where: { id: req.params.id }, data });
    res.json(set);
  })
);

kpiSetsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.kpiSet.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

const kpiInput = z.object({
  kpiSetId: z.string(),
  name: z.string().min(1),
  metricUnit: z.string().optional().nullable(),
  targetValue: z.number(),
  currentValue: z.number().optional(),
  personId: z.string().optional().nullable(),
  period: z.enum(["weekly", "monthly", "quarterly", "annual"]).optional(),
  status: z.enum(["on-track", "at-risk", "off-track", "done"]).optional(),
});

kpisRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = kpiInput.parse(req.body);
    const kpi = await prisma.kpi.create({ data, include: { person: true } });
    res.status(201).json(kpi);
  })
);

kpisRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = kpiInput.partial().parse(req.body);
    const kpi = await prisma.kpi.update({
      where: { id: req.params.id },
      data,
      include: { person: true },
    });
    res.json(kpi);
  })
);

kpisRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.kpi.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

const goalInput = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  ownerId: z.string(),
  kpiId: z.string().optional().nullable(),
  targetDate: z.string().datetime().optional().nullable(),
  progress: z.number().min(0).max(100).optional(),
  status: z.enum(["on-track", "at-risk", "off-track", "done"]).optional(),
});

goalsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { ownerId } = req.query;
    const goals = await prisma.goal.findMany({
      where: ownerId ? { ownerId: String(ownerId) } : undefined,
      include: { owner: true, kpi: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(goals);
  })
);

goalsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = goalInput.parse(req.body);
    const goal = await prisma.goal.create({ data, include: { owner: true, kpi: true } });
    res.status(201).json(goal);
  })
);

goalsRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = goalInput.partial().parse(req.body);
    const goal = await prisma.goal.update({
      where: { id: req.params.id },
      data,
      include: { owner: true, kpi: true },
    });
    res.json(goal);
  })
);

goalsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.goal.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);
