import { z } from "zod";
import { sanitizeHtml } from "./sanitizeHtml.js";

// Every Zod schema on the server lives in this one file, so a route
// handler or store function never has to guess where a shape is defined -
// domain schemas (lesson/module/course/user/voucher/...) and the
// request-body schemas each route validates against both live here.

// --- Theme ---

export const ThemeValuesSchema = z.object({
  primaryColor: z.string(),
  backgroundColor: z.string(),
  fontFamily: z.string(),
});
export type ThemeValues = z.infer<typeof ThemeValuesSchema>;

export const ThemeOverrideSchema = ThemeValuesSchema.partial();
export type ThemeOverride = z.infer<typeof ThemeOverrideSchema>;

// --- Users & auth ---

export const UserRoleSchema = z.enum(["student", "admin", "super_admin"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

// "password" is every normal account (register, admin-created) - it has a
// real password and can log in through the login form. "embed" is an
// account auto-provisioned from an embed link (see server/src/index.ts's
// /api/embed) - it has no usable password and only ever exists to hold
// course assignments and progress for a visitor coming from an embedded
// iframe. Defaults to "password" so every account created before this
// field existed still parses as the (correct) normal case.
export const AuthOriginSchema = z.enum(["password", "embed"]);
export type AuthOrigin = z.infer<typeof AuthOriginSchema>;
// Applied everywhere a password is being SET (register, self-service
// change, admin reset) - never for login, which has to keep accepting
// whatever password an existing account was created with, complexity
// rules or not. Zod reports every failing rule at once (via
// sendValidationError's issue-joining), not just the first, so a weak
// password gets one message listing everything still missing.
export const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")
  .regex(/[^A-Za-z0-9]/, "Password must contain a symbol");

// Public-safe user shape - never carries a password or password hash.
// assignedLearningPathIds/assignedCourseIds default to [] so existing
// stored users (from before this field existed) still parse - an admin
// hasn't assigned them anything yet, which is exactly what an empty array
// means.
export const UserSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleSchema,
  assignedLearningPathIds: z.array(z.string()).default([]),
  assignedCourseIds: z.array(z.string()).default([]),
  authOrigin: AuthOriginSchema.default("password"),
  // Absent for a user with no originating voucher (every account created
  // before this feature existed, plus the seeded demo accounts) - such a
  // user never expires. Present for a voucher-registered user: memberSince
  // is the voucher's issuedAt, membershipExpiresAt is the point login stops
  // working unless an admin issues a new voucher.
  memberSince: z.number().optional(),
  membershipExpiresAt: z.number().optional(),
});
export type User = z.infer<typeof UserSchema>;

// --- Vouchers ---

export const VoucherStatusSchema = z.enum(["pending", "registered", "revoked"]);
export type VoucherStatus = z.infer<typeof VoucherStatusSchema>;

// A voucher is not a user - it's an admin's intent to let exactly one email
// address register as a specific name/role. voucherId doubles as the
// unguessable secret embedded in the sign-up link (it's a
// crypto.randomUUID(), same as every other id in this app), so there's no
// separate "code" field to keep in sync with it.
export const VoucherSchema = z.object({
  voucherId: z.string(),
  email: z.string().email(),
  // The name the admin entered when issuing the voucher - becomes the
  // registered user's name. Registration doesn't collect a name of its
  // own; the voucher is the only place it's set.
  name: z.string().min(1),
  // Held on the voucher, not decided at registration - stops a client from
  // self-elevating by passing its own `role` in the register request.
  role: UserRoleSchema,
  issuedAt: z.number(),
  // Absent for an admin/super_admin voucher - those never expire, and
  // neither does the account it becomes (see createVoucher and
  // isVoucherExpired in voucherStore.ts). Present (issuedAt +
  // VOUCHER_VALIDITY_MS) for a student voucher.
  expiresAt: z.number().optional(),
  status: VoucherStatusSchema,
  // Set once the voucher is consumed - kept around (rather than deleting
  // the voucher) both as an audit trail and because the resulting user
  // record links back to this voucher for its own membership-expiry check.
  registeredUserId: z.string().optional(),
  registeredAt: z.number().optional(),
});
export type Voucher = z.infer<typeof VoucherSchema>;

export function parseVoucher(data: unknown): Voucher {
  return VoucherSchema.parse(data);
}

// What the public, unauthenticated GET /api/vouchers/:voucherId (used by
// the register page to greet the invitee and catch an already-used/expired
// voucher before they fill out the form) is allowed to return - notably
// never registeredUserId, which would leak another user's id to anyone
// holding the link after it's been used.
export const PublicVoucherSchema = VoucherSchema.pick({
  voucherId: true,
  email: true,
  name: true,
  role: true,
  expiresAt: true,
  status: true,
});
export type PublicVoucher = z.infer<typeof PublicVoucherSchema>;

// --- Display preference (per-user) ---

export const LessonDisplayModeSchema = z.enum(["vertical", "carousel", "accessible"]);
export type LessonDisplayMode = z.infer<typeof LessonDisplayModeSchema>;

export const ColorSchemeSchema = z.enum(["light", "dark"]);
export type ColorScheme = z.infer<typeof ColorSchemeSchema>;

// --- Lessons, modules, courses, learning paths ---

export const LessonSourceSchema = z.enum(["human", "ai_generated"]);
export type LessonSource = z.infer<typeof LessonSourceSchema>;

export const WordingStyleSchema = z.enum(["official", "shortened"]);
export type WordingStyle = z.infer<typeof WordingStyleSchema>;

export const ModuleStatusSchema = z.enum(["draft", "ai_generated", "published"]);
export type ModuleStatus = z.infer<typeof ModuleStatusSchema>;

export const CourseStatusSchema = z.enum(["draft", "published"]);
export type CourseStatus = z.infer<typeof CourseStatusSchema>;

// Every schema below that's persisted (module, course, learning path) can
// have any of its optional fields read back from Mongo as a literal `null`
// instead of genuinely absent - the driver used to silently turn an
// undefined-valued field into BSON null on write, before ignoreUndefined
// was set on the client (see db/index.ts). Plain `.optional()` only ever
// accepted undefined, not null, so a document already affected by this
// would fail Zod validation - and since a save round-trips whatever a
// previous read returned, that meant it could never be saved again either.
// This normalizes null back to undefined so already-stored data keeps
// working without a migration.
function nullableOptional<T extends z.ZodTypeAny>(schema: T) {
  return schema.nullish().transform((val) => val ?? undefined);
}

const TextContentSchema = z.object({
  // Rich markup from the admin's text editor (headings, lists, emphasis,
  // etc.), sanitized on parse for the same reason CustomHtmlContentSchema
  // below is - every write path (API, seed data, the Rise importer) goes
  // through this schema, so none of them can forget to sanitize.
  body: z.string().transform((html) => sanitizeHtml(html)),
});

const VideoContentSchema = z.object({
  videoUrl: z.string(),
  // Rich markup from the admin's text editor, same as TextContentSchema.body
  // - sanitized on parse so every write path gets it for free. Applied
  // inside the transform (not via .transform on the outer nullableOptional)
  // so it only runs when a transcript is actually present.
  transcript: nullableOptional(z.string().transform((html) => sanitizeHtml(html))),
  duration: nullableOptional(z.number().nonnegative()),
});

const QuizContentSchema = z.object({
  questions: z
    .array(
      z.object({
        prompt: z.string(),
        options: z.array(z.string()).min(2),
        correctIndex: z.number().int().nonnegative(),
      })
    )
    .min(1),
});

const PracticalContentSchema = z.object({
  // Rich markup, same as TextContentSchema.body - sanitized on parse.
  instructions: z.string().transform((html) => sanitizeHtml(html)),
  steps: z.array(z.string()),
  submissionType: z.enum(["text", "file", "checklist"]),
});

const DiagramContentSchema = z.object({
  imageUrl: z.string(),
});

const FlashcardContentSchema = z.object({
  cards: z.array(z.object({ front: z.string(), back: z.string() })).min(1),
});

const AccordionContentSchema = z.object({
  // Section body is rich markup, same as TextContentSchema.body - sanitized
  // on parse. Title stays plain text (a short heading, not prose).
  sections: z.array(z.object({ title: z.string(), body: z.string().transform((html) => sanitizeHtml(html)) })).min(1),
});

const MatchingContentSchema = z.object({
  pairs: z.array(z.object({ prompt: z.string(), match: z.string() })).min(2),
});

// The number of stages *is* the number of circles on the dial - there's no
// separate "circle count" field, it's just stages.length. At least 2 so the
// dial has something to step between; at most 20 so the ring stays legible
// even as each node's size shrinks to fit them all.
const DialContentSchema = z.object({
  // Stage body is rich markup, sanitized on parse - see AccordionContentSchema.
  stages: z.array(z.object({ title: z.string(), body: z.string().transform((html) => sanitizeHtml(html)) })).min(2).max(20),
});

// A horizontal progress track - the same one-title-one-body-per-step shape
// as the dial, just capped much lower (7) since every step's label sits
// inline in a single row rather than shrinking into a small ring.
const PipelineContentSchema = z.object({
  // Step body is rich markup, sanitized on parse - see AccordionContentSchema.
  steps: z.array(z.object({ title: z.string(), body: z.string().transform((html) => sanitizeHtml(html)) })).min(2).max(7),
});

// A "presentation mode" dial - unlike the dial above, which rings every
// stage around the circle at once, this only ever shows a 4-wide trailing
// window of stages ending at the current one, navigated with prev/next
// rather than by clicking a stage directly. Same title/body-per-stage
// shape and the same 2-20 bounds as the dial, since it's stepping
// through the same kind of content, just windowed instead of full-ring.
const PresentationDialContentSchema = z.object({
  // Stage body is rich markup, sanitized on parse - see AccordionContentSchema.
  stages: z.array(z.object({ title: z.string(), body: z.string().transform((html) => sanitizeHtml(html)) })).min(2).max(20),
});

// A grid of comparison cards, always laid out 3 per row and wrapping (and
// centering incomplete rows) beyond that - so at least 2 cards, since
// comparing needs something to compare against, and no upper cap since
// extra cards just add rows rather than crowding a fixed shape.
const CardGridContentSchema = z.object({
  cards: z
    .array(
      z.object({
        title: z.string(),
        // Rich markup, sanitized on parse - see AccordionContentSchema.
        // title/noteLabel stay plain text (short headings/labels, not prose).
        useWhen: z.string().transform((html) => sanitizeHtml(html)),
        looksLike: z.string().transform((html) => sanitizeHtml(html)),
        noteLabel: z.string(),
        noteBody: z.string().transform((html) => sanitizeHtml(html)),
      })
    )
    .min(2),
});

// A grid of clickable tiles (5 per row, wrapping and centering beyond
// that, like the card grid), each popping open a note above itself on
// click. At least 2 to be worth a grid; no upper cap since extra tiles
// just add rows rather than crowding a fixed shape.
const HotspotsContentSchema = z.object({
  // Body/example are rich markup, sanitized on parse - see AccordionContentSchema.
  tiles: z
    .array(
      z.object({
        title: z.string(),
        body: z.string().transform((html) => sanitizeHtml(html)),
        example: z.string().transform((html) => sanitizeHtml(html)),
      })
    )
    .min(2),
});

// A scroll-scrubbed tree: node 0 is always the root, and every other
// node names its parent by array index. Requiring parentIndex < the
// node's own index makes a cycle structurally impossible (a node can
// only point at an already-defined, earlier node) and gives siblings
// under the same parent for free - any number of nodes can share a
// parentIndex, and the client's layout fans them out by angle instead
// of stacking them. At least 2 (a lone root isn't a tree); capped at
// 20 since the client renders every node's own screen position, and a
// tree that large needs the zoom-on-scroll behavior to stay legible.
const TreeScrubContentSchema = z.object({
  // Body is rich markup, sanitized on parse - see AccordionContentSchema.
  nodes: z
    .array(
      z.object({
        title: z.string(),
        body: z.string().transform((html) => sanitizeHtml(html)),
        parentIndex: z.number().int().nonnegative(),
      })
    )
    .min(2)
    .max(20)
    .superRefine((nodes, ctx) => {
      nodes.forEach((node, i) => {
        if (i === 0) return;
        if (node.parentIndex >= i) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Node ${i}'s parentIndex must reference an earlier node (got ${node.parentIndex})`,
            path: [i, "parentIndex"],
          });
        }
      });
    }),
});

const CustomHtmlContentSchema = z.object({
  // Sanitized as part of parsing itself, not in a separate step someone
  // could forget to call - every write path (create, save, seed, the Rise
  // importer) goes through parseModule/LessonSchema, so every one of them
  // gets this for free.
  html: z.string().transform((html) => sanitizeHtml(html)),
});

const EmbedContentSchema = z.object({
  // Empty is allowed - it's the blank-lesson factory's starting state, same
  // as every other lesson type's content, and a module has to be saveable
  // as a draft before the admin has filled it in. Once non-empty, though,
  // http(s) only - anything else (javascript:, data:) is a known iframe-src
  // XSS vector, not just an unsanitized-content problem.
  url: z
    .string()
    .refine(
      (u) => u === "" || (/^https?:\/\//i.test(u) && z.string().url().safeParse(u).success),
      "Embed URL must start with http:// or https://"
    ),
});

const ExamBreakdownContentSchema = z.object({
  passMarkPercent: z.number().min(0).max(100),
  timeLimitMinutes: z.number().int().positive(),
  questionCount: z.number().int().positive(),
  openBook: z.boolean(),
});

// A live chat against a system prompt the student can edit - each preset is
// a different system prompt they can load to see how it changes the bot's
// behavior. The length caps aren't just content hygiene here: systemPrompt
// becomes the literal `system` field on a real Anthropic API call per
// message sent, so an unbounded prompt is an unbounded per-message cost.
const PromptSimulationPresetSchema = z.object({
  label: z.string().max(80),
  note: z.string().max(160).optional(),
  systemPrompt: z.string().max(4000),
});

const PromptSimulationContentSchema = z.object({
  botName: z.string().max(80),
  botAvatar: z.string().max(8).optional(),
  lede: z.string().transform((html) => sanitizeHtml(html)),
  presets: z.array(PromptSimulationPresetSchema).min(1).max(8),
  quickReplies: z.array(z.string().max(200)).max(6).default([]),
});

const LessonBaseSchema = z.object({
  lessonId: z.string(),
  schemaVersion: z.number().int().positive(),
  source: LessonSourceSchema,
  wordingStyle: WordingStyleSchema,
  order: z.number().int().nonnegative(),
  // Every lesson has one regardless of type - what's shown for it on the
  // module view (StudentLessonBlock, AdminModuleEditor's lesson list), in
  // place of the old per-type content-derived preview text. Defaulted
  // rather than required so lessons persisted before this field existed
  // still parse.
  title: z.string().default("Untitled lesson"),
});

export const TextLessonSchema = LessonBaseSchema.extend({
  type: z.literal("text"),
  content: TextContentSchema,
});

export const VideoLessonSchema = LessonBaseSchema.extend({
  type: z.literal("video"),
  content: VideoContentSchema,
});

export const QuizLessonSchema = LessonBaseSchema.extend({
  type: z.literal("quiz"),
  content: QuizContentSchema,
});

export const PracticalLessonSchema = LessonBaseSchema.extend({
  type: z.literal("practical"),
  content: PracticalContentSchema,
});

export const DiagramLessonSchema = LessonBaseSchema.extend({
  type: z.literal("diagram"),
  content: DiagramContentSchema,
});

export const FlashcardLessonSchema = LessonBaseSchema.extend({
  type: z.literal("flashcard"),
  content: FlashcardContentSchema,
});

export const AccordionLessonSchema = LessonBaseSchema.extend({
  type: z.literal("accordion"),
  content: AccordionContentSchema,
});

export const MatchingLessonSchema = LessonBaseSchema.extend({
  type: z.literal("matching"),
  content: MatchingContentSchema,
});

export const DialLessonSchema = LessonBaseSchema.extend({
  type: z.literal("dial"),
  content: DialContentSchema,
});

export const PipelineLessonSchema = LessonBaseSchema.extend({
  type: z.literal("pipeline"),
  content: PipelineContentSchema,
});

export const PresentationDialLessonSchema = LessonBaseSchema.extend({
  type: z.literal("presentationDial"),
  content: PresentationDialContentSchema,
});

export const CardGridLessonSchema = LessonBaseSchema.extend({
  type: z.literal("cardGrid"),
  content: CardGridContentSchema,
});

export const HotspotsLessonSchema = LessonBaseSchema.extend({
  type: z.literal("hotspots"),
  content: HotspotsContentSchema,
});

export const TreeScrubLessonSchema = LessonBaseSchema.extend({
  type: z.literal("treeScrub"),
  content: TreeScrubContentSchema,
});

export const CustomHtmlLessonSchema = LessonBaseSchema.extend({
  type: z.literal("html"),
  content: CustomHtmlContentSchema,
});

export const EmbedLessonSchema = LessonBaseSchema.extend({
  type: z.literal("embed"),
  content: EmbedContentSchema,
});

export const ExamBreakdownLessonSchema = LessonBaseSchema.extend({
  type: z.literal("examBreakdown"),
  content: ExamBreakdownContentSchema,
});

export const PromptSimulationLessonSchema = LessonBaseSchema.extend({
  type: z.literal("promptSimulation"),
  content: PromptSimulationContentSchema,
});

export const LessonSchema = z.discriminatedUnion("type", [
  TextLessonSchema,
  VideoLessonSchema,
  QuizLessonSchema,
  PracticalLessonSchema,
  DiagramLessonSchema,
  FlashcardLessonSchema,
  AccordionLessonSchema,
  MatchingLessonSchema,
  DialLessonSchema,
  PipelineLessonSchema,
  PresentationDialLessonSchema,
  CardGridLessonSchema,
  HotspotsLessonSchema,
  TreeScrubLessonSchema,
  CustomHtmlLessonSchema,
  EmbedLessonSchema,
  ExamBreakdownLessonSchema,
  PromptSimulationLessonSchema,
]);

export type Lesson = z.infer<typeof LessonSchema>;
export type TextLesson = z.infer<typeof TextLessonSchema>;
export type VideoLesson = z.infer<typeof VideoLessonSchema>;
export type QuizLesson = z.infer<typeof QuizLessonSchema>;
export type PracticalLesson = z.infer<typeof PracticalLessonSchema>;
export type DiagramLesson = z.infer<typeof DiagramLessonSchema>;
export type FlashcardLesson = z.infer<typeof FlashcardLessonSchema>;
export type AccordionLesson = z.infer<typeof AccordionLessonSchema>;
export type MatchingLesson = z.infer<typeof MatchingLessonSchema>;
export type DialLesson = z.infer<typeof DialLessonSchema>;
export type PipelineLesson = z.infer<typeof PipelineLessonSchema>;
export type PresentationDialLesson = z.infer<typeof PresentationDialLessonSchema>;
export type CardGridLesson = z.infer<typeof CardGridLessonSchema>;
export type HotspotsLesson = z.infer<typeof HotspotsLessonSchema>;
export type TreeScrubLesson = z.infer<typeof TreeScrubLessonSchema>;
export type CustomHtmlLesson = z.infer<typeof CustomHtmlLessonSchema>;
export type EmbedLesson = z.infer<typeof EmbedLessonSchema>;
export type ExamBreakdownLesson = z.infer<typeof ExamBreakdownLessonSchema>;
export type PromptSimulationLesson = z.infer<typeof PromptSimulationLessonSchema>;
export type LessonType = Lesson["type"];

export const ModuleSeedSchema = z.object({
  title: z.string(),
  objective: z.string(),
  authorNotes: nullableOptional(z.string()),
  rawContent: nullableOptional(z.string()),
});

export const ModuleSchema = z.object({
  moduleId: z.string(),
  // Absent when the module isn't (or is no longer) part of any course - see
  // `category` below, which is how such a module still gets placed in the
  // admin library tree.
  courseId: nullableOptional(z.string()),
  // Only meaningful when courseId is absent: the category the module was
  // removed from (or created under) via the library, so it still has a home
  // in the tree without a course to look the category up from.
  category: nullableOptional(z.string()),
  status: ModuleStatusSchema,
  seed: ModuleSeedSchema,
  lessons: z.array(LessonSchema),
  // Where this module sits among its course's other modules - lower first.
  // Defaulted (not required) so modules saved before this field existed
  // still parse; backfillModuleOrder assigns each of those its current
  // position once at startup (see store.ts).
  order: z.number().int().nonnegative().default(0),
});

export type Module = z.infer<typeof ModuleSchema>;

export function parseModule(data: unknown): Module {
  return ModuleSchema.parse(data);
}

export const CourseSchema = z.object({
  courseId: z.string(),
  title: z.string(),
  // Rich markup, sanitized on parse - see AccordionContentSchema.
  description: nullableOptional(z.string().transform((html) => sanitizeHtml(html))),
  category: nullableOptional(z.string()),
  // Only the fields this course chooses to override - see Theme.withOverrides() on the client.
  theme: ThemeOverrideSchema.default({}),
  // Same idea as a module's status - a course starts as a draft, invisible
  // to anyone but admins/super_admins, until explicitly published (see
  // userHasCourseAccess). Defaults to "draft" rather than requiring
  // every course-creation call site to say so explicitly, the same way
  // `theme` above defaults to no overrides.
  status: CourseStatusSchema.default("draft"),
  // Where this course's content originally came from, if anywhere - purely
  // informational, shown only on admin pages (see AdminCourseList/Detail).
  // Not surfaced to students: a module's own description text used to leak
  // "Imported from Rise 360." into student-facing pages as a fallback (see
  // riseImport.ts) before this field replaced it as the intended, properly
  // admin-only way to record that.
  importedFrom: nullableOptional(z.enum(["rise360"])),
});

export type Course = z.infer<typeof CourseSchema>;

export function parseCourse(data: unknown): Course {
  return CourseSchema.parse(data);
}

export const LearningPathSchema = z.object({
  pathId: z.string(),
  title: z.string(),
  // Rich markup, sanitized on parse - see AccordionContentSchema.
  description: nullableOptional(z.string().transform((html) => sanitizeHtml(html))),
  // Ordered - a student moves through these courses one by one.
  courseIds: z.array(z.string()).default([]),
});

export type LearningPath = z.infer<typeof LearningPathSchema>;

export function parseLearningPath(data: unknown): LearningPath {
  return LearningPathSchema.parse(data);
}

// --- API request schemas (one per route that validates a body/query) ---
// Grouped by the route section they belong to in index.ts, in the same
// order those sections appear there.

// name and role are deliberately not part of this - both live on the
// voucher (see VoucherSchema above) and are copied from there, not taken
// from the request body, so a client can't self-elevate by passing its own
// role, and can't get a name a course admin never actually invited.
export const RegisterSchema = z.object({
  voucherId: z.string().min(1),
  email: z.string().email(),
  password: PasswordSchema,
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: PasswordSchema,
});

export const EmbedQuerySchema = z.object({
  email: z.string().email(),
  courseId: z.string().min(1),
  moduleId: z.string().min(1),
});

// Not currently wired to a route - kept for whenever a direct
// super_admin-create-user endpoint (as opposed to voucher-based
// invitation) is added.
export const CreateUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: UserRoleSchema,
});

export const UpdateUserRoleSchema = z.object({ role: UserRoleSchema });

export const UpdateUserPasswordSchema = z.object({ newPassword: PasswordSchema });

export const SetUserAssignmentsSchema = z.object({
  assignedLearningPathIds: z.array(z.string()),
  assignedCourseIds: z.array(z.string()),
});

export const CreateVoucherInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: UserRoleSchema,
});

export const CreateCourseInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  theme: ThemeOverrideSchema.optional(),
});

export const CoursePatchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  theme: ThemeOverrideSchema.optional(),
  status: CourseStatusSchema.optional(),
});

export const CreateModuleInputSchema = z.object({
  courseId: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  title: z.string().min(1),
  objective: z.string().min(1),
  // Only meaningful (and required, enforced by the route that creates it -
  // not by this schema) when creating a standalone library module - an
  // empty unassigned module is clutter, not a reusable component, so
  // creation is refused rather than persisting one.
  lessons: z.array(LessonSchema).optional(),
});

export const ReorderModulesSchema = z.object({
  moduleIds: z.array(z.string().min(1)).min(1),
});

export const CreateLearningPathInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  courseIds: z.array(z.string()).optional(),
});

export const LearningPathPatchSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  courseIds: z.array(z.string()).optional(),
});

// courseId/moduleId are optional so completion can still be recorded
// without them, but the route also updates lastCompleted (the module a
// student most recently finished a lesson in) when they're present and the
// lesson is being marked complete, not uncompleted.
export const SetLessonProgressSchema = z.object({
  completed: z.boolean(),
  courseId: z.string().min(1).optional(),
  moduleId: z.string().min(1).optional(),
});

export const SetDisplayPreferenceSchema = z.object({ lessonDisplayMode: LessonDisplayModeSchema });

export const SetColorSchemeSchema = z.object({ colorScheme: ColorSchemeSchema });

export const SupportMessageSchema = z.object({ message: z.string().trim().min(1).max(5000) });

export const BugReportSchema = z.object({
  description: z.string().trim().min(1).max(5000),
  stepsToReproduce: z.string().trim().max(5000).optional(),
  pageUrl: z.string().trim().max(2000).optional(),
});

// The caps here bound real per-message API cost the same way
// PromptSimulationPresetSchema's do - systemPrompt and every turn's content
// go straight into a live Anthropic request.
export const PromptSimulationChatRequestSchema = z.object({
  systemPrompt: z.string().min(1).max(4000),
  turns: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(30),
});
