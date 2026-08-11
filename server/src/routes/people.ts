import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler } from "../asyncHandler.js";

export const peopleRouter = Router();

const personInput = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  title: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  avatarColor: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  managerId: z.string().optional().nullable(),
});

peopleRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const people = await prisma.person.findMany({ orderBy: { name: "asc" } });
    res.json(people);
  })
);

peopleRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const person = await prisma.person.findUnique({
      where: { id: req.params.id },
      include: { reports: true, manager: true },
    });
    if (!person) return res.status(404).json({ error: "Person not found" });
    res.json(person);
  })
);

peopleRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = personInput.parse(req.body);
    const person = await prisma.person.create({ data });
    res.status(201).json(person);
  })
);

peopleRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = personInput.partial().parse(req.body);
    if (data.managerId === req.params.id) {
      return res.status(400).json({ error: "A person cannot manage themselves" });
    }
    const person = await prisma.person.update({ where: { id: req.params.id }, data });
    res.json(person);
  })
);

// Dedicated endpoint for org-chart drag-and-drop reassignment
peopleRouter.patch(
  "/:id/manager",
  asyncHandler(async (req, res) => {
    const { managerId } = z.object({ managerId: z.string().nullable() }).parse(req.body);
    if (managerId === req.params.id) {
      return res.status(400).json({ error: "A person cannot manage themselves" });
    }
    if (managerId) {
      // prevent cycles: walk up from the proposed manager and ensure req.params.id isn't an ancestor
      let cursor: string | null = managerId;
      while (cursor) {
        if (cursor === req.params.id) {
          return res.status(400).json({ error: "This would create a reporting cycle" });
        }
        const next: { managerId: string | null } | null = await prisma.person.findUnique({
          where: { id: cursor },
          select: { managerId: true },
        });
        cursor = next?.managerId ?? null;
      }
    }
    const person = await prisma.person.update({
      where: { id: req.params.id },
      data: { managerId },
    });
    res.json(person);
  })
);

peopleRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.person.updateMany({
      where: { managerId: req.params.id },
      data: { managerId: null },
    });
    await prisma.person.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);
