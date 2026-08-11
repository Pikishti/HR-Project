import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler } from "../asyncHandler.js";

export const projectsRouter = Router();

const projectInput = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  color: z.string().optional(),
  status: z.enum(["active", "archived"]).optional(),
});

const sectionInput = z.object({
  name: z.string().min(1),
  order: z.number().optional(),
});

projectsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { tasks: true } } },
    });
    res.json(projects);
  })
);

projectsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        sections: { orderBy: { order: "asc" } },
        tasks: {
          where: { parentTaskId: null },
          orderBy: { order: "asc" },
          include: { assignee: true, tags: { include: { tag: true } }, subtasks: true },
        },
      },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  })
);

projectsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = projectInput.parse(req.body);
    const project = await prisma.project.create({
      data: {
        ...data,
        sections: {
          create: [
            { name: "To Do", order: 0 },
            { name: "In Progress", order: 1 },
            { name: "Done", order: 2 },
          ],
        },
      },
      include: { sections: true },
    });
    res.status(201).json(project);
  })
);

projectsRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = projectInput.partial().parse(req.body);
    const project = await prisma.project.update({ where: { id: req.params.id }, data });
    res.json(project);
  })
);

projectsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

projectsRouter.post(
  "/:id/sections",
  asyncHandler(async (req, res) => {
    const data = sectionInput.parse(req.body);
    const section = await prisma.section.create({
      data: { ...data, projectId: req.params.id },
    });
    res.status(201).json(section);
  })
);

projectsRouter.put(
  "/sections/:sectionId",
  asyncHandler(async (req, res) => {
    const data = sectionInput.partial().parse(req.body);
    const section = await prisma.section.update({
      where: { id: req.params.sectionId },
      data,
    });
    res.json(section);
  })
);

projectsRouter.delete(
  "/sections/:sectionId",
  asyncHandler(async (req, res) => {
    await prisma.section.delete({ where: { id: req.params.sectionId } });
    res.status(204).end();
  })
);
