import { ColorSchemeSchema, LessonDisplayModeSchema } from "./displayPreference.js";
import { LessonSchema, ModuleSchema } from "./schemas.js";
import { ThemeOverrideSchema } from "./theme.js";
import { UserRoleSchema, type UserRole } from "./userSchema.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { z } from "zod";
import { createSession, destroySession, getSessionUserId } from "./auth.js";
import { connectDb } from "./db/index.js";
import {
  getColorScheme,
  getLessonDisplayMode,
  initPreferencesStore,
  setColorScheme,
  setLessonDisplayMode,
} from "./preferencesStore.js";
import { getCompletedLessons, getLastVisited, initProgressStore, setLastVisited, setLessonCompletion } from "./progressStore.js";
import { convertRiseCourse, RiseImportError } from "./riseImport.js";
import { extractRiseRuntimeData, RiseZipError } from "./riseZip.js";
import { seedSampleData } from "./sampleData.js";
import { seedUsers } from "./seedUsers.js";
import {
  createCourse,
  createLearningPath,
  createModule,
  deleteCourse,
  deleteModule,
  getCourse,
  getLearningPath,
  getModule,
  initStore,
  listAllModules,
  listCourses,
  listLearningPaths,
  listModulesByCourse,
  patchCourse,
  patchLearningPath,
  saveModule,
  unassignModule,
  userHasCourseAccess,
} from "./store.js";
import {
  createUser,
  getUserById,
  initUserStore,
  listUsers,
  setUserAssignments,
  setUserRole,
  updatePassword,
  verifyCredentials,
  verifyCurrentPassword,
} from "./userStore.js";

const app = express();
const port = process.env.PORT ?? 4000;
const SESSION_COOKIE = "lms_session";
// In production the client and server are on different domains (e.g. a
// Netlify frontend and a Render backend), so the cookie needs SameSite=None
// (which browsers only honor over HTTPS, hence secure too) and CORS needs
// to be locked to that exact origin rather than reflecting anything. Locally
// they share an origin family (localhost), so the old lax/permissive
// behavior is kept unless these are explicitly configured.
const isProduction = process.env.NODE_ENV === "production";
const clientOrigin = process.env.CLIENT_ORIGIN;
const cookieOptions = { httpOnly: true, sameSite: isProduction ? ("none" as const) : ("lax" as const), secure: isProduction };

app.use(cors({ origin: clientOrigin ?? true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

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
  res.cookie(SESSION_COOKIE, sessionId, cookieOptions);
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
  res.clearCookie(SESSION_COOKIE, cookieOptions);
  res.status(204).end();
});

app.get("/api/auth/me", (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json(req.user);
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

app.put("/api/auth/me/password", requireAuth, async (req, res) => {
  const parsed = ChangePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const currentIsValid = await verifyCurrentPassword(req.user!.userId, parsed.data.currentPassword);
  if (!currentIsValid) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }
  await updatePassword(req.user!.userId, parsed.data.newPassword);
  res.status(204).end();
});

// --- User management (super_admin only) ---

const CreateUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: UserRoleSchema,
});

// Listing users (name/email/role/assignments) is needed by the course/
// learning-path assignment UI, which regular admins also use - unlike
// creating accounts or changing role/password, which stay super_admin-only.
app.get("/api/users", requireRole("admin", "super_admin"), async (_req, res) => {
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

app.patch("/api/users/:userId/password", requireRole("super_admin"), async (req, res) => {
  const parsed = z.object({ newPassword: z.string().min(8) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const updated = await updatePassword(req.params.userId, parsed.data.newPassword);
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.status(204).end();
});

const SetUserAssignmentsSchema = z.object({
  assignedLearningPathIds: z.array(z.string()),
  assignedCourseIds: z.array(z.string()),
});

app.patch("/api/users/:userId/assignments", requireRole("admin", "super_admin"), async (req, res) => {
  const parsed = SetUserAssignmentsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  const updated = await setUserAssignments(req.params.userId, parsed.data);
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
  category: z.string().optional(),
  theme: ThemeOverrideSchema.optional(),
});

const CoursePatchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  theme: ThemeOverrideSchema.optional(),
});

const CreateModuleInputSchema = z.object({
  courseId: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  title: z.string().min(1),
  objective: z.string().min(1),
  // Only meaningful (and required, enforced below) when creating a
  // standalone library module - an empty unassigned module is clutter, not
  // a reusable component, so creation is refused rather than persisting one.
  lessons: z.array(LessonSchema).optional(),
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
    category: parsed.data.category,
    theme: parsed.data.theme ?? {},
  });
  res.status(201).json(course);
});

const riseUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 },
});

app.post(
  "/api/courses/import/rise",
  requireRole("admin", "super_admin"),
  riseUpload.single("file"),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded - expected a Rise 360 .zip export under field 'file'" });
      return;
    }

    let converted;
    try {
      const raw = extractRiseRuntimeData(req.file.buffer);
      converted = convertRiseCourse(raw);
    } catch (err) {
      if (err instanceof RiseZipError || err instanceof RiseImportError) {
        res.status(400).json({ error: err.message });
        return;
      }
      throw err;
    }

    const category = typeof req.body.category === "string" && req.body.category.trim() ? req.body.category.trim() : undefined;

    const course = await createCourse({
      courseId: crypto.randomUUID(),
      title: converted.title,
      description: converted.description || undefined,
      category,
      theme: {},
    });

    await Promise.all(
      converted.modules.map((m) => createModule({ courseId: course.courseId, title: m.title, objective: m.objective, lessons: m.lessons }))
    );

    // createCourse() above also created the mandatory orientation module, so
    // the count reported here is every module the course now has, not just
    // the ones converted from the Rise file - what the admin actually sees
    // when they open the course.
    const allModules = await listModulesByCourse(course.courseId);
    res.status(201).json({ course, moduleCount: allModules.length, skipped: converted.skipped });
  }
);

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

app.delete("/api/courses/:courseId", requireRole("admin", "super_admin"), async (req, res) => {
  await deleteCourse(req.params.courseId);
  res.status(204).end();
});

app.get("/api/courses/:courseId/modules", requireAuth, async (req, res) => {
  if (!(await userHasCourseAccess(req.user!, req.params.courseId))) {
    res.status(403).json({ error: "You don't have access to this course" });
    return;
  }
  res.json(await listModulesByCourse(req.params.courseId));
});

app.get("/api/modules", requireRole("admin", "super_admin"), async (_req, res) => {
  res.json(await listAllModules());
});

app.post("/api/modules", requireRole("admin", "super_admin"), async (req, res) => {
  const parsed = CreateModuleInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  if (!parsed.data.courseId && (parsed.data.lessons ?? []).length === 0) {
    res.status(400).json({ error: "A standalone library module needs at least one lesson to be worth saving" });
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
  if (!module.courseId || !(await userHasCourseAccess(req.user!, module.courseId))) {
    res.status(403).json({ error: "You don't have access to this course" });
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

app.patch("/api/modules/:moduleId/unassign", requireRole("admin", "super_admin"), async (req, res) => {
  const updated = await unassignModule(req.params.moduleId);
  // A module that ends up with no content is deleted rather than kept as an
  // empty library entry - a 204 here means "gone", not "not found".
  if (updated) res.json(updated);
  else res.status(204).end();
});

app.delete("/api/modules/:moduleId", requireRole("admin", "super_admin"), async (req, res) => {
  await deleteModule(req.params.moduleId);
  res.status(204).end();
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
  const [completedLessonIds, lastVisited] = await Promise.all([
    getCompletedLessons(req.user!.userId),
    getLastVisited(req.user!.userId),
  ]);
  res.json({ completedLessonIds, lastVisited });
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

// Records the module a student most recently opened, so "Continue where you
// left off" can deep-link straight back to it instead of just the course.
app.put("/api/progress/last-visited", requireAuth, async (req, res) => {
  const parsed = z.object({ courseId: z.string().min(1), moduleId: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  await setLastVisited(req.user!.userId, parsed.data.courseId, parsed.data.moduleId);
  res.json({ ok: true });
});

// --- Display preference (per-user) ---

app.get("/api/preferences", requireAuth, async (req, res) => {
  const [lessonDisplayMode, colorScheme] = await Promise.all([
    getLessonDisplayMode(req.user!.userId),
    getColorScheme(req.user!.userId),
  ]);
  res.json({ lessonDisplayMode, colorScheme });
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

app.put("/api/preferences/color-scheme", requireAuth, async (req, res) => {
  const parsed = z.object({ colorScheme: ColorSchemeSchema }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }
  await setColorScheme(req.user!.userId, parsed.data.colorScheme);
  res.json({ colorScheme: parsed.data.colorScheme });
});

async function main() {
  const db = await connectDb();
  await Promise.all([initStore(db), initUserStore(db), initProgressStore(db), initPreferencesStore(db)]);

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
