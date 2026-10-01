import { sendBugReport, sendSupportMessage, sendVoucherEmail } from "./mailer.js";
import {
  BugReportSchema,
  ChangePasswordSchema,
  CoursePatchSchema,
  CreateCourseInputSchema,
  CreateLearningPathInputSchema,
  CreateModuleInputSchema,
  CreateVoucherInputSchema,
  EmbedQuerySchema,
  LearningPathPatchSchema,
  LoginSchema,
  ModuleSchema,
  RegisterSchema,
  SetColorSchemeSchema,
  SetDisplayPreferenceSchema,
  SetLessonProgressSchema,
  SetUserAssignmentsSchema,
  SupportMessageSchema,
  UpdateUserPasswordSchema,
  UpdateUserRoleSchema,
  type UserRole,
} from "./schemas.js";
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
import path from "node:path";
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
import { convertRiseCourse, mergeConvertedModules, RiseImportError } from "./riseImport.js";
import { extractRiseRuntimeData, RiseZipError } from "./riseZip.js";
import { sampleModules, seedSampleData } from "./sampleData.js";
import { aiEngineeringModules } from "./riseImportedCourses.js";
import { seedUsers } from "./seedUsers.js";
import {
  createCourse,
  createLearningPath,
  createModule,
  backfillMissingLessonTitles,
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
import { isAllowedImageType, saveUploadedImage } from "./uploads.js";
import {
  createUser,
  findOrCreateEmbedUser,
  getUserById,
  grantCourseAccess,
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
// Uploaded lesson images, served back out under /api/uploads (see the
// static mount below) - a plain local directory, same fallback-storage
// philosophy as DATA_DIR (see db/index.ts). Note this doesn't persist
// across deploys/restarts on a host with an ephemeral filesystem (e.g.
// Render's default disk) - a real deployment wanting uploads to survive
// that needs either a persistent disk mounted at this path or swapping
// saveUploadedImage for an object-storage backend.
const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.join(process.cwd(), ".uploads");
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
// voucherStore.ts's VOUCHER_VALIDITY_MS) has passed. Absent for a user
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

// An embed-origin session (see /api/embed below) only ever exists to view
// the one module its link granted - default-deny rather than gating each
// route individually, so a route added later is automatically off-limits
// to it instead of silently open until someone remembers to lock it down.
const EMBED_ALLOWED_PATHS = [
  /^\/api\/auth\//,
  /^\/api\/embed$/,
  /^\/api\/courses\/[^/]+$/,
  /^\/api\/modules\/[^/]+$/,
  /^\/api\/progress(\/|$)/,
];

app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.user?.authOrigin === "embed" && !EMBED_ALLOWED_PATHS.some((pattern) => pattern.test(req.path))) {
    res.status(403).json({ error: "Not available in embedded view" });
    return;
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

// --- Embed (passwordless entry from an external site, e.g. an iframe) ---

// Hit directly by the visitor's browser (not the external site's backend) -
// see the design discussion this implements: an embed link grants access to
// exactly one module, auto-provisioning a passwordless account by email the
// first time a given visitor is seen. No email/expiry step - the URL itself
// is the credential, on the understanding that anyone who can edit it is
// already inside the external site's own gated content.
app.get("/api/embed", async (req, res) => {
  const parsed = EmbedQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }
  const { email, courseId, moduleId } = parsed.data;

  const course = await getCourse(courseId);
  if (!course) {
    res.status(404).json({ error: "Course not found" });
    return;
  }
  const module = await getModule(moduleId);
  if (!module || module.courseId !== courseId || module.status !== "published") {
    res.status(404).json({ error: "Module not found" });
    return;
  }

  const user = await findOrCreateEmbedUser(email);
  if (!user) {
    res.status(403).json({ error: "This email is already registered - embedded access isn't available for it" });
    return;
  }

  await grantCourseAccess(user.userId, courseId);
  setSessionCookie(res, user.userId);
  res.json({ ok: true });
});

// --- User management (super_admin only) ---

// --- User management ---

// Listing users (name/email/role/assignments) is needed by the course/
// learning-path assignment UI, which regular admins also use - unlike
// changing role/password, which stay super_admin-only.
app.get("/api/users", requireRole("admin", "super_admin"), async (_req, res) => {
  res.json(await listUsers());
});

app.patch("/api/users/:userId/role", requireRole("super_admin"), async (req, res) => {
  const parsed = UpdateUserRoleSchema.safeParse(req.body);
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
  const parsed = UpdateUserPasswordSchema.safeParse(req.body);
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
// schemas.ts's PublicVoucherSchema) - never registeredUserId.
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
      importedFrom: "rise360",
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

// Same Rise 360 conversion as above, but attached to an existing course
// instead of creating a new one, and collapsed into a single module rather
// than one module per top-level Rise lesson - the whole export becomes one
// module on the target course, with its lessons kept in the same order (see
// mergeConvertedModules).
app.post(
  "/api/courses/:courseId/import/rise",
  requireRole("admin", "super_admin"),
  riseUpload.single("file"),
  async (req, res) => {
    const course = await getCourse(req.params.courseId);
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }
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

    const merged = mergeConvertedModules(converted);
    const module = await createModule({
      courseId: course.courseId,
      title: merged.title,
      objective: merged.objective,
      lessons: merged.lessons,
    });

    res.status(201).json({ module, skipped: converted.skipped });
  }
);

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

// For the diagram lesson type's image field - admin-only, same as the Rise
// import above. Returns a path relative to this API (not the client), which
// the client resolves against its own configured API base URL at render
// time (see resolveAssetUrl in client/src/api.ts) since client and API can
// be on different origins in production.
app.post("/api/uploads/image", requireRole("admin", "super_admin"), imageUpload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded - expected an image under field 'file'" });
    return;
  }
  if (!isAllowedImageType(req.file.mimetype)) {
    res.status(400).json({ error: `Unsupported image type: ${req.file.mimetype}. Allowed: PNG, JPEG, GIF, WEBP.` });
    return;
  }
  const url = await saveUploadedImage(UPLOADS_DIR, req.file.buffer, req.file.mimetype);
  res.status(201).json({ url });
});

// Publicly readable, same trust model as any external image URL an admin
// could otherwise paste into the same field - not behind requireAuth.
app.use("/api/uploads", express.static(UPLOADS_DIR));

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

// --- Learning paths ---

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
  const parsed = SetLessonProgressSchema.safeParse(req.body);
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
  const parsed = SetDisplayPreferenceSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }
  await setLessonDisplayMode(req.user!.userId, parsed.data.lessonDisplayMode);
  res.json({ lessonDisplayMode: parsed.data.lessonDisplayMode });
});

app.put("/api/preferences/color-scheme", requireAuth, async (req, res) => {
  const parsed = SetColorSchemeSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }
  await setColorScheme(req.user!.userId, parsed.data.colorScheme);
  res.json({ colorScheme: parsed.data.colorScheme });
});

// --- Support ---

app.post("/api/support", requireAuth, async (req, res) => {
  const parsed = SupportMessageSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }
  const sent = await sendSupportMessage({ fromName: req.user!.name, fromEmail: req.user!.email, message: parsed.data.message });
  res.json({ sent });
});

app.post("/api/support/bug-report", requireAuth, async (req, res) => {
  const parsed = BugReportSchema.safeParse(req.body);
  if (!parsed.success) {
    sendValidationError(res, parsed.error);
    return;
  }
  const sent = await sendBugReport({
    fromName: req.user!.name,
    fromEmail: req.user!.email,
    description: parsed.data.description,
    stepsToReproduce: parsed.data.stepsToReproduce || undefined,
    pageUrl: parsed.data.pageUrl || undefined,
  });
  res.json({ sent });
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
  await Promise.all([initStore(db), initUserStore(db), initVoucherStore(db), initProgressStore(db), initPreferencesStore(db)]);

  await seedUsers();
  await seedSampleData();

  const knownLessonTitles = new Map(
    [...sampleModules, ...aiEngineeringModules].flatMap((m) => m.lessons.map((l) => [l.lessonId, l.title] as const))
  );
  await backfillMissingLessonTitles(knownLessonTitles);

  app.listen(port, () => {
    console.log(`LMS API listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
