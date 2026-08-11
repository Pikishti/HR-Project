import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { asyncHandler } from "../asyncHandler.js";

export const tasksRouter = Router();

const taskInclude = {
  assignee: true,
  tags: { include: { tag: true } },
  subtasks: { include: { assignee: true } },
  comments: { include: { author: true }, orderBy: { createdAt: "asc" as const } },
};

const taskInput = z.object({
  projectId: z.string(),
  sectionId: z.string().optional().nullable(),
  parentTaskId: z.string().optional().nullable(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  completed: z.boolean().optional(),
  order: z.number().optional(),
});

tasksRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { projectId, assigneeId, completed } = req.query;
    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId ? { projectId: String(projectId) } : {}),
        ...(assigneeId ? { assigneeId: String(assigneeId) } : {}),
        ...(completed !== undefined ? { completed: completed === "true" } : {}),
      },
      include: { ...taskInclude, project: true },
      orderBy: [{ dueDate: "asc" }, { order: "asc" }],
    });
    res.json(tasks);
  })
);

tasksRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: { ...taskInclude, project: true },
    });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  })
);

tasksRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = taskInput.parse(req.body);
    const task = await prisma.task.create({ data, include: taskInclude });
    res.status(201).json(task);
  })
);

tasksRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = taskInput.partial().parse(req.body);
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data,
      include: taskInclude,
    });
    res.json(task);
  })
);

// Drag-and-drop: move a task to a different section and/or position
tasksRouter.patch(
  "/:id/move",
  asyncHandler(async (req, res) => {
    const { sectionId, order } = z
      .object({ sectionId: z.string().nullable(), order: z.number() })
      .parse(req.body);
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { sectionId, order },
      include: taskInclude,
    });
    res.json(task);
  })
);

tasksRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

tasksRouter.post(
  "/:id/comments",
  asyncHandler(async (req, res) => {
    const { authorId, body } = z
      .object({ authorId: z.string(), body: z.string().min(1) })
      .parse(req.body);
    const comment = await prisma.comment.create({
      data: { taskId: req.params.id, authorId, body },
      include: { author: true },
    });
    res.status(201).json(comment);
  })
);

tasksRouter.post(
  "/:id/tags",
  asyncHandler(async (req, res) => {
    const { tagId } = z.object({ tagId: z.string() }).parse(req.body);
    await prisma.taskTag.create({ data: { taskId: req.params.id, tagId } });
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: taskInclude,
    });
    res.status(201).json(task);
  })
);

tasksRouter.delete(
  "/:id/tags/:tagId",
  asyncHandler(async (req, res) => {
    await prisma.taskTag.delete({
      where: { taskId_tagId: { taskId: req.params.id, tagId: req.params.tagId } },
    });
    res.status(204).end();
  })
);

export const tagsRouter = Router();

tagsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    res.json(tags);
  })
);

tagsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = z.object({ name: z.string().min(1), color: z.string().optional() }).parse(req.body);
    const tag = await prisma.tag.create({ data });
    res.status(201).json(tag);
  })
);
