import { ColorSchemeSchema, LessonDisplayModeSchema } from "./displayPreference.js";
import { sendVoucherEmail } from "./mailer.js";
import { CourseStatusSchema, LessonSchema, ModuleSchema } from "./schemas.js";
import { ThemeOverrideSchema } from "./theme.js";
import { PasswordSchema, UserRoleSchema, type UserRole } from "./userSchema.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
// Express 4 doesn't forward a rejected promise from an async route handler
// to error-handling middleware on its own - an unhandled one used to just
// hang the request forever with nothing logged. This patches route
// dispatch so every async handler's rejection reaches the error handler
// below instead. Side-effecting import - must run before any app.use/get/
// post/etc. below.
import "express-async-errors";
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
import { getCompletedLessons, getLastCompleted, initProgressStore, setLastCompleted, setLessonCompletion } from "./progressStore.js";
import { convertRiseCourse, RiseImportError } from "./riseImport.js";
import { extractRiseRuntimeData, RiseZipError } from "./riseZip.js";
import { seedSampleData } from "./sampleData.js";
import { seedUsers } from "./seedUsers.js";
import { createReviewComment, initReviewCommentStore, listCommentsForLesson } from "./reviewCommentStore.js";
import {
  clearLessonReview,
  createCourse,
  createLearningPath,
  createModule,
  deleteCourse,
  deleteModule,
  flagLessonChangesRequested,
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
  submitLessonForReview,
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
import {
  checkVoucherForRegistration,
  createVoucher,
  getVoucher,
  initVoucherStore,
  listVouchers,
  markVoucherRegistered,
  revokeVoucher,
  toPublicVoucher,
  VOUCHER_REGISTRATION_ERROR_MESSAGES,
} from "./voucherStore.js";

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

// True once a voucher-registered user's one-year window (see
// voucherSchema.ts's VOUCHER_VALIDITY_MS) has passed. Absent for a user
// with no originating voucher (pre-voucher accounts, seeded demo
// accounts), who never expire.
function isMembershipExpired(user: { membershipExpiresAt?: number }): boolean {
  return user.membershipExpiresAt !== undefined && Date.now() > user.membershipExpiresAt;
}

app.use(async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.cookies[SESSION_COOKIE];
  const userId = getSessionUserId(sessionId);
  const user = userId ? await getUserById(userId) : undefined;
  // Checked on every request, not just at login - a session created before
  // the one-year mark shouldn't keep working past it just because the user
  // never logged out. Kill the session outright rather than leaving it to
  // silently keep re-checking on every future request.
  if (user && isMembershipExpired(user)) {
    destroySession(sessionId);
    res.clearCookie(SESSION_COOKIE, cookieOptions);
    req.user = undefined;
  } else {
    req.user = user;
  }
  next();
});

// Every route responds to a failed schema parse with this, instead of the
// raw ZodIssue array - the client only ever showed a generic "Request
// failed: 400" for these before, since its error-message extraction only
// trusts a string `error` field. A path-qualified message (e.g.
// "lessons.0.content.url: Embed URL must start with http:// or https://")
// tells the admin (and us, debugging their report) exactly what to fix.
function sendValidationError(res: Response, error: z.ZodError) {
  const message = error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`).join("; ");
  res.status(400).json({ error: message, issues: error.issues });
}

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

// name and role are deliberately not part of this - both live on the
// voucher (see voucherSchema.ts) and are copied from there, not taken from
// the request body, so a client can't self-elevate by passing its own
// role, and can't get a name a course admin never actually invited.
const RegisterSchema = z.object({
  voucherId: z.string().min(1),
  email: z.string().email(),
  password: PasswordSchema,
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
    sendValidationError(res, parsed.error);
    return;
  }
  const { voucherId, email, password } = parsed.data;

  const voucher = await getVoucher(voucherId);
  if (!voucher) {
    res.status(404).json({ error: "This invitation link isn't valid." });
    return;
  }
  const problem = checkVoucherForRegistration(voucher, email);
  if (problem) {
    res.status(400).json({ error: VOUCHER_REGISTRATION_ERROR_MESSAGES[problem] });
    return;
  }

  try {
    const user = await createUser({ email, name: voucher.name, password, role: voucher.role, voucherId: voucher.voucherId });
    await markVoucherRegistered(voucher.voucherId, user.userId);
    setSessionCookie(res, user.userId);
    res.status(201).json(user);
  } catch (err) {
    res.status(409).json({ error: (err as Error).message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }
  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  if (isMembershipExpired(user)) {
    res.status(401).json({ error: "Your access has expired. Contact an administrator for a new invitation." });
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
  newPassword: PasswordSchema,
});

app.put("/api/auth/me/password", requireAuth, async (req, res) => {
  const parsed = ChangePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
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

// --- User management ---

// Listing users (name/email/role/assignments) is needed by the course/
// learning-path assignment UI, which regular admins also use - unlike
// changing role/password, which stay super_admin-only.
app.get("/api/users", requireRole("admin", "super_admin"), async (_req, res) => {
  res.json(await listUsers());
});

app.patch("/api/users/:userId/role", requireRole("super_admin"), async (req, res) => {
  const parsed = z.object({ role: UserRoleSchema }).safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
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
  const parsed = z.object({ newPassword: PasswordSchema }).safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
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
    sendValidationError(res, parsed.error);
    return;
  }
  const updated = await setUserAssignments(req.params.userId, parsed.data);
  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(updated);
});

// --- Vouchers ---

const CreateVoucherInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: UserRoleSchema,
});

// Only super_admin can issue an admin/super_admin voucher - mirrors the
// existing rule that only super_admin can hand out privileged roles at
// all (see the role-patch route above). A plain admin can still invite
// students, which is the replacement for what used to be open self-signup.
function canIssueRole(issuer: UserRole, role: UserRole): boolean {
  return role === "student" || issuer === "super_admin";
}

app.get("/api/vouchers", requireRole("admin", "super_admin"), async (_req, res) => {
  res.json(await listVouchers());
});

// Public and unauthenticated on purpose - the register page needs this to
// greet the invitee by name and catch an already-used/expired/revoked
// voucher before showing the form, before the visitor has any session.
// voucherId is an unguessable UUID (the link's whole security model), and
// this only ever returns the public-safe projection (see
// voucherSchema.ts's PublicVoucherSchema) - never registeredUserId.
app.get("/api/vouchers/:voucherId", async (req, res) => {
  const voucher = await getVoucher(req.params.voucherId);
  if (!voucher) {
    res.status(404).json({ error: "This invitation link isn't valid." });
    return;
  }
  res.json(toPublicVoucher(voucher));
});

app.post("/api/vouchers", requireRole("admin", "super_admin"), async (req, res) => {
  const parsed = CreateVoucherInputSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }
  if (!canIssueRole(req.user!.role, parsed.data.role)) {
    res.status(403).json({ error: "Only a super admin can invite an admin or super admin." });
    return;
  }
  const voucher = await createVoucher(parsed.data);
  const emailSent = await sendVoucherEmail({
    to: voucher.email,
    name: voucher.name,
    voucherId: voucher.voucherId,
    role: voucher.role,
    expiresAt: voucher.expiresAt,
  });
  res.status(201).json({ voucher, emailSent });
});

app.patch("/api/vouchers/:voucherId/revoke", requireRole("admin", "super_admin"), async (req, res) => {
  const voucher = await getVoucher(req.params.voucherId);
  if (!voucher) {
    res.status(404).json({ error: "Voucher not found" });
    return;
  }
  if (!canIssueRole(req.user!.role, voucher.role)) {
    res.status(403).json({ error: "Only a super admin can revoke an admin or super admin invitation." });
    return;
  }
  const updated = await revokeVoucher(req.params.voucherId);
  if (!updated) {
    res.status(400).json({ error: "Only a pending invitation can be revoked." });
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
  status: CourseStatusSchema.optional(),
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
    sendValidationError(res, parsed.error);
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
    sendValidationError(res, parsed.error);
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
    sendValidationError(res, parsed.error);
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
    sendValidationError(res, parsed.error);
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

// --- Lesson review comments (admin/super_admin/reviewer only - never a student) ---

const CreateReviewCommentSchema = z.object({ body: z.string().min(1) });

async function findLessonOr404(moduleId: string, lessonId: string, res: Response) {
  const module = await getModule(moduleId);
  const lesson = module?.lessons.find((l) => l.lessonId === lessonId);
  if (!module || !lesson) {
    res.status(404).json({ error: "Lesson not found" });
    return undefined;
  }
  return module;
}

app.get(
  "/api/modules/:moduleId/lessons/:lessonId/comments",
  requireRole("admin", "super_admin", "reviewer"),
  async (req, res) => {
    if (!(await findLessonOr404(req.params.moduleId, req.params.lessonId, res))) return;
    res.json(await listCommentsForLesson(req.params.lessonId));
  }
);

// Only a reviewer posts a comment - posting one is also what flags the
// lesson "changesRequested" (see flagLessonChangesRequested), which is
// what actually drives the admin-facing side of the workflow.
app.post("/api/modules/:moduleId/lessons/:lessonId/comments", requireRole("reviewer"), async (req, res) => {
  const parsed = CreateReviewCommentSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }
  if (!(await findLessonOr404(req.params.moduleId, req.params.lessonId, res))) return;
  const comment = await createReviewComment({
    lessonId: req.params.lessonId,
    moduleId: req.params.moduleId,
    authorUserId: req.user!.userId,
    authorName: req.user!.name,
    body: parsed.data.body,
  });
  await flagLessonChangesRequested(req.params.moduleId, req.params.lessonId);
  res.status(201).json(comment);
});

app.patch(
  "/api/modules/:moduleId/lessons/:lessonId/submit-for-review",
  requireRole("admin", "super_admin"),
  async (req, res) => {
    const module = await submitLessonForReview(req.params.moduleId, req.params.lessonId);
    if (!module) {
      res.status(404).json({ error: "Module not found" });
      return;
    }
    res.json(module);
  }
);

app.patch(
  "/api/modules/:moduleId/lessons/:lessonId/clear-review",
  requireRole("admin", "super_admin", "reviewer"),
  async (req, res) => {
    const module = await clearLessonReview(req.params.moduleId, req.params.lessonId);
    if (!module) {
      res.status(404).json({ error: "Module not found" });
      return;
    }
    res.json(module);
  }
);

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
    sendValidationError(res, parsed.error);
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
    sendValidationError(res, parsed.error);
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
  const [completedLessonIds, lastCompleted] = await Promise.all([
    getCompletedLessons(req.user!.userId),
    getLastCompleted(req.user!.userId),
  ]);
  res.json({ completedLessonIds, lastCompleted });
});

// courseId/moduleId are optional so completion can still be recorded without
// them, but when present and the lesson is being marked complete (not
// uncompleted), they also update lastCompleted - the module a student most
// recently finished a lesson in, which "Continue where you left off"
// deep-links straight back to instead of just the course.
app.put("/api/progress/lessons/:lessonId", requireAuth, async (req, res) => {
  const parsed = z
    .object({ completed: z.boolean(), courseId: z.string().min(1).optional(), moduleId: z.string().min(1).optional() })
    .safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }
  await setLessonCompletion(req.user!.userId, req.params.lessonId, parsed.data.completed);
  if (parsed.data.completed && parsed.data.courseId && parsed.data.moduleId) {
    await setLastCompleted(req.user!.userId, parsed.data.courseId, parsed.data.moduleId);
  }
  res.json({ completedLessonIds: await getCompletedLessons(req.user!.userId) });
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
    sendValidationError(res, parsed.error);
    return;
  }
  await setLessonDisplayMode(req.user!.userId, parsed.data.lessonDisplayMode);
  res.json({ lessonDisplayMode: parsed.data.lessonDisplayMode });
});

app.put("/api/preferences/color-scheme", requireAuth, async (req, res) => {
  const parsed = z.object({ colorScheme: ColorSchemeSchema }).safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }
  await setColorScheme(req.user!.userId, parsed.data.colorScheme);
  res.json({ colorScheme: parsed.data.colorScheme });
});

// Catches anything a route handler didn't already turn into its own
// response - a thrown/rejected error from a store, the DB layer, or
// anywhere else. Must be registered after every route (Express only
// treats a 4-arg middleware as an error handler) and last, so it's the
// backstop the Rise-import route's `throw err` (and any of the async
// handlers above) actually lands in - express-async-errors is what gets a
// rejected promise here in the first place. Logs the full error server-side
// (this is what "console.log/tail the server output" actually shows for a
// 500), and only ever sends a generic message to the client - the real
// detail belongs in the log, not in a response an attacker could read too.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.error(`[error] ${req.method} ${req.originalUrl}:`, err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
});

async function main() {
  const db = await connectDb();
  await Promise.all([
    initStore(db),
    initUserStore(db),
    initVoucherStore(db),
    initProgressStore(db),
    initPreferencesStore(db),
    initReviewCommentStore(db),
  ]);

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
