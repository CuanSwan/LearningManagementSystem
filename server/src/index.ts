import { LessonDisplayModeSchema } from "./displayPreference.js";
import { ModuleSchema } from "./schemas.js";
import { ThemeOverrideSchema } from "./theme.js";
import { UserRoleSchema, type UserRole } from "./userSchema.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { createSession, destroySession, getSessionUserId } from "./auth.js";
import { connectDb } from "./db/index.js";
import { getLessonDisplayMode, initPreferencesStore, setLessonDisplayMode } from "./preferencesStore.js";
import { getCompletedLessons, initProgressStore, setLessonCompletion } from "./progressStore.js";
import { seedSampleData } from "./sampleData.js";
import { seedUsers } from "./seedUsers.js";
import {
  createCourse,
  createLearningPath,
  createModule,
  getCourse,
  getLearningPath,
  getModule,
  initStore,
  listCourses,
  listLearningPaths,
  listModulesByCourse,
  patchCourse,
  patchLearningPath,
  saveModule,
} from "./store.js";
import { createUser, getUserById, initUserStore, listUsers, setUserRole, verifyCredentials } from "./userStore.js";

const app = express();
const port = process.env.PORT ?? 4000;
const SESSION_COOKIE = "lms_session";

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(async (req: Request, _res: Response, next: NextFunction) => {
  const userId = getSessionUserId(req.cookies[SESSION_COOKIE]);
  req.user = userId ? await getUserById(userId) : undefined;
  next();
});

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }
    next();
  };
}

// --- Auth ---

const RegisterSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function setSessionCookie(res: Response, userId: string) {
  const sessionId = createSession(userId);
  res.cookie(SESSION_COOKIE, sessionId, { httpOnly: true, sameSite: "lax" });
}

app.post("/api/auth/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  try {
    const user = await createUser({ ...parsed.data, role: "student" });
    setSessionCookie(res, user.userId);
    res.status(201).json(user);
  } catch (err) {
    res.status(409).json({ error: (err as Error).message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  setSessionCookie(res, user.userId);
  res.json(user);
});

app.post("/api/auth/logout", (req, res) => {
  destroySession(req.cookies[SESSION_COOKIE]);
  res.clearCookie(SESSION_COOKIE);
  res.status(204).end();
});

app.get("/api/auth/me", (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(req.user);
});

// --- User management (super_admin only) ---

const CreateUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: UserRoleSchema,
});

app.get("/api/users", requireRole("super_admin"), async (_req, res) => {
  res.json(await listUsers());
});

app.post("/api/users", requireRole("super_admin"), async (req, res) => {
  const parsed = CreateUserInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  try {
    res.status(201).json(await createUser(parsed.data));
  } catch (err) {
    res.status(409).json({ error: (err as Error).message });
  }
});

app.patch("/api/users/:userId/role", requireRole("super_admin"), async (req, res) => {
  const parsed = z.object({ role: UserRoleSchema }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const updated = await setUserRole(req.params.userId, parsed.data.role);
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(updated);
});

// --- Courses & modules ---

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

app.get("/api/courses", requireAuth, async (_req, res) => {
  res.json(await listCourses());
});

app.post("/api/courses", requireRole("admin", "super_admin"), async (req, res) => {
  const parsed = CreateCourseInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const course = await createCourse({
    courseId: crypto.randomUUID(),
    title: parsed.data.title,
    description: parsed.data.description,
    theme: parsed.data.theme ?? {},
  });
  res.status(201).json(course);
});

app.get("/api/courses/:courseId", requireAuth, async (req, res) => {
  const course = await getCourse(req.params.courseId);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.json(course);
});

app.patch("/api/courses/:courseId", requireRole("admin", "super_admin"), async (req, res) => {
  const parsed = CoursePatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const updated = await patchCourse(req.params.courseId, parsed.data);
  if (!updated) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  res.json(updated);
});

app.get("/api/courses/:courseId/modules", requireAuth, async (req, res) => {
  res.json(await listModulesByCourse(req.params.courseId));
});

app.post("/api/modules", requireRole("admin", "super_admin"), async (req, res) => {
  const parsed = CreateModuleInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const module = await createModule(parsed.data);
  res.status(201).json(module);
});

app.get("/api/modules/:moduleId", requireAuth, async (req, res) => {
  const module = await getModule(req.params.moduleId);
  if (!module) {
    res.status(404).json({ error: "Module not found" });
    return;
  }
  res.json(module);
});

app.put("/api/modules/:moduleId", requireRole("admin", "super_admin"), async (req, res) => {
  const parsed = ModuleSchema.safeParse({ ...req.body, moduleId: req.params.moduleId });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const saved = await saveModule(req.params.moduleId, parsed.data);
  res.json(saved);
});

// --- Learning paths ---

const CreateLearningPathInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  courseIds: z.array(z.string()).optional(),
});

const LearningPathPatchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  courseIds: z.array(z.string()).optional(),
});

app.get("/api/learning-paths", requireAuth, async (_req, res) => {
  res.json(await listLearningPaths());
});

app.post("/api/learning-paths", requireRole("admin", "super_admin"), async (req, res) => {
  const parsed = CreateLearningPathInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const path = await createLearningPath({
    pathId: crypto.randomUUID(),
    title: parsed.data.title,
    description: parsed.data.description,
    courseIds: parsed.data.courseIds ?? [],
  });
  res.status(201).json(path);
});

app.get("/api/learning-paths/:pathId", requireAuth, async (req, res) => {
  const path = await getLearningPath(req.params.pathId);
  if (!path) {
    res.status(404).json({ error: "Learning path not found" });
    return;
  }
  res.json(path);
});

app.patch("/api/learning-paths/:pathId", requireRole("admin", "super_admin"), async (req, res) => {
  const parsed = LearningPathPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const updated = await patchLearningPath(req.params.pathId, parsed.data);
  if (!updated) {
    res.status(404).json({ error: "Learning path not found" });
    return;
  }
  res.json(updated);
});

// --- Lesson completion (per-user) ---

app.get("/api/progress", requireAuth, async (req, res) => {
  res.json({ completedLessonIds: await getCompletedLessons(req.user!.userId) });
});

app.put("/api/progress/lessons/:lessonId", requireAuth, async (req, res) => {
  const parsed = z.object({ completed: z.boolean() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  await setLessonCompletion(req.user!.userId, req.params.lessonId, parsed.data.completed);
  res.json({ completedLessonIds: await getCompletedLessons(req.user!.userId) });
});

// --- Display preference (per-user) ---

app.get("/api/preferences", requireAuth, async (req, res) => {
  res.json({ lessonDisplayMode: await getLessonDisplayMode(req.user!.userId) });
});

app.put("/api/preferences", requireAuth, async (req, res) => {
  const parsed = z.object({ lessonDisplayMode: LessonDisplayModeSchema }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  await setLessonDisplayMode(req.user!.userId, parsed.data.lessonDisplayMode);
  res.json({ lessonDisplayMode: parsed.data.lessonDisplayMode });
});

async function main() {
  const db = await connectDb();
  initStore(db);
  initUserStore(db);
  initProgressStore(db);
  initPreferencesStore(db);

  await seedUsers();
  await seedSampleData();

  app.listen(port, () => {
    console.log(`LMS API listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
