import { ModuleSchema, ThemeOverrideSchema } from "@lms/shared";
import cors from "cors";
import express from "express";
import { z } from "zod";
import { seedSampleData } from "./sampleData.js";
import {
  createCourse,
  createModule,
  getCourse,
  getModule,
  listCourses,
  listModulesByCourse,
  patchCourse,
  saveModule,
} from "./store.js";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

seedSampleData();

const CreateCourseInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  theme: ThemeOverrideSchema.optional(),
});

const CoursePatchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  theme: ThemeOverrideSchema.optional(),
});

const CreateModuleInputSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1),
  objective: z.string().min(1),
});

app.get("/api/courses", (_req, res) => {
  res.json(listCourses());
});

app.post("/api/courses", (req, res) => {
  const parsed = CreateCourseInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const course = createCourse({
    courseId: crypto.randomUUID(),
    title: parsed.data.title,
    description: parsed.data.description,
    theme: parsed.data.theme ?? {},
  });
  res.status(201).json(course);
});

app.get("/api/courses/:courseId", (req, res) => {
  const course = getCourse(req.params.courseId);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.json(course);
});

app.patch("/api/courses/:courseId", (req, res) => {
  const parsed = CoursePatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const updated = patchCourse(req.params.courseId, parsed.data);
  if (!updated) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.json(updated);
});

app.get("/api/courses/:courseId/modules", (req, res) => {
  res.json(listModulesByCourse(req.params.courseId));
});

app.post("/api/modules", (req, res) => {
  const parsed = CreateModuleInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const module = createModule(parsed.data);
  res.status(201).json(module);
});

app.get("/api/modules/:moduleId", (req, res) => {
  const module = getModule(req.params.moduleId);
  if (!module) {
    res.status(404).json({ error: "Module not found" });
    return;
  }
  res.json(module);
});

app.put("/api/modules/:moduleId", (req, res) => {
  const parsed = ModuleSchema.safeParse({ ...req.body, moduleId: req.params.moduleId });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const saved = saveModule(req.params.moduleId, parsed.data);
  res.json(saved);
});

app.listen(port, () => {
  console.log(`LMS API listening on http://localhost:${port}`);
});
