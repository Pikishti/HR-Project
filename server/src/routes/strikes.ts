import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler } from "../asyncHandler.js";

export const categoriesRouter = Router();
export const strikeRecordsRouter = Router();

const categoryInput = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

const tierInput = z.object({
  name: z.string().min(1),
  level: z.number().int(),
  consequenceDescription: z.string().optional().nullable(),
});

categoriesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.infractionCategory.findMany({
      orderBy: { name: "asc" },
      include: { tiers: { orderBy: { level: "asc" } } },
    });
    res.json(categories);
  })
);

categoriesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = categoryInput.parse(req.body);
    const category = await prisma.infractionCategory.create({ data });
    res.status(201).json(category);
  })
);

categoriesRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = categoryInput.partial().parse(req.body);
    const category = await prisma.infractionCategory.update({
      where: { id: req.params.id },
      data,
    });
    res.json(category);
  })
);

categoriesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.infractionCategory.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

categoriesRouter.post(
  "/:id/tiers",
  asyncHandler(async (req, res) => {
    const data = tierInput.parse(req.body);
    const tier = await prisma.strikeTier.create({
      data: { ...data, categoryId: req.params.id },
    });
    res.status(201).json(tier);
  })
);

categoriesRouter.put(
  "/tiers/:tierId",
  asyncHandler(async (req, res) => {
    const data = tierInput.partial().parse(req.body);
    const tier = await prisma.strikeTier.update({
      where: { id: req.params.tierId },
      data,
    });
    res.json(tier);
  })
);

categoriesRouter.delete(
  "/tiers/:tierId",
  asyncHandler(async (req, res) => {
    await prisma.strikeTier.delete({ where: { id: req.params.tierId } });
    res.status(204).end();
  })
);

const strikeRecordInput = z.object({
  personId: z.string(),
  categoryId: z.string(),
  tierId: z.string(),
  reason: z.string().min(1),
  issuedById: z.string().optional().nullable(),
  dateIssued: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

strikeRecordsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { personId, categoryId } = req.query;
    const records = await prisma.strikeRecord.findMany({
      where: {
        ...(personId ? { personId: String(personId) } : {}),
        ...(categoryId ? { categoryId: String(categoryId) } : {}),
      },
      include: { person: true, category: true, tier: true, issuedBy: true },
      orderBy: { dateIssued: "desc" },
    });
    res.json(records);
  })
);

strikeRecordsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = strikeRecordInput.parse(req.body);
    const record = await prisma.strikeRecord.create({
      data,
      include: { person: true, category: true, tier: true, issuedBy: true },
    });
    res.status(201).json(record);
  })
);

strikeRecordsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.strikeRecord.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);
