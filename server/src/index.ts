import express from "express";
import cors from "cors";
import { ZodError } from "zod";
import { peopleRouter } from "./routes/people.js";
import { projectsRouter } from "./routes/projects.js";
import { tasksRouter, tagsRouter } from "./routes/tasks.js";
import { kpiSetsRouter, kpisRouter, goalsRouter } from "./routes/kpis.js";
import { categoriesRouter, strikeRecordsRouter } from "./routes/strikes.js";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.use("/api/people", peopleRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/kpi-sets", kpiSetsRouter);
app.use("/api/kpis", kpisRouter);
app.use("/api/goals", goalsRouter);
app.use("/api/infraction-categories", categoriesRouter);
app.use("/api/strike-records", strikeRecordsRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Validation error", details: err.issues });
  }
  console.error(err);
  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ error: message });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
