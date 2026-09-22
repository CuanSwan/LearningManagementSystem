// Plain client-side types matching the JSON the server's API returns.
// The server is the single source of truth for validation (via its own
// Zod schemas) - the client only needs to describe these shapes for its
// own type checking, not re-validate them.

export type LessonSource = "human" | "ai_generated";
export type WordingStyle = "official" | "shortened";
export type ModuleStatus = "draft" | "ai_generated" | "published";

interface LessonBase {
  lessonId: string;
  schemaVersion: number;
  source: LessonSource;
  wordingStyle: WordingStyle;
  order: number;
}

export interface TextLesson extends LessonBase {
  type: "text";
  content: { body: string };
}

export interface VideoLesson extends LessonBase {
  type: "video";
  content: { videoUrl: string; transcript?: string; duration?: number };
}

export interface QuizQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface QuizLesson extends LessonBase {
  type: "quiz";
  content: { questions: QuizQuestion[] };
}

export interface PracticalLesson extends LessonBase {
  type: "practical";
  content: { instructions: string; steps: string[]; submissionType: "text" | "file" | "checklist" };
}

export interface DiagramLesson extends LessonBase {
  type: "diagram";
  content: { imageUrl: string };
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FlashcardLesson extends LessonBase {
  type: "flashcard";
  content: { cards: Flashcard[] };
}

export interface AccordionSection {
  title: string;
  body: string;
}

export interface AccordionLesson extends LessonBase {
  type: "accordion";
  content: { sections: AccordionSection[] };
}

export interface MatchingPair {
  prompt: string;
  match: string;
}

export interface MatchingLesson extends LessonBase {
  type: "matching";
  content: { pairs: MatchingPair[] };
}

export interface DialStage {
  title: string;
  body: string;
}

// A ring of selectable stages arranged around a dial - the number of
// stages *is* the number of circles, there's no separate count field.
export interface DialLesson extends LessonBase {
  type: "dial";
  content: { stages: DialStage[] };
}

export interface PipelineStep {
  title: string;
  body: string;
}

// A horizontal progress track - the same title/body-per-step shape as the
// dial, capped lower (7) since every step's label sits inline in one row.
export interface PipelineLesson extends LessonBase {
  type: "pipeline";
  content: { steps: PipelineStep[] };
}

export interface PresentationDialStage {
  title: string;
  body: string;
}

// A "presentation mode" dial - unlike DialLesson, which rings every stage
// around the circle at once, this only ever shows a 4-wide trailing window
// of stages ending at the current one, navigated with prev/next.
export interface PresentationDialLesson extends LessonBase {
  type: "presentationDial";
  content: { stages: PresentationDialStage[] };
}

export interface CardGridCard {
  title: string;
  useWhen: string;
  looksLike: string;
  noteLabel: string;
  noteBody: string;
}

// A grid of comparison cards, always laid out 3 per row and wrapping (and
// centering incomplete rows) beyond that.
export interface CardGridLesson extends LessonBase {
  type: "cardGrid";
  content: { cards: CardGridCard[] };
}

export interface HotspotTile {
  title: string;
  body: string;
  example: string;
}

// A single-row grid of clickable tiles, each popping open a note above
// itself on click (only one open at a time).
export interface HotspotsLesson extends LessonBase {
  type: "hotspots";
  content: { tiles: HotspotTile[] };
}

export interface TreeScrubNode {
  title: string;
  body: string;
  // Index into the same nodes array. Node 0 is always the root (its own
  // parentIndex is unused); every other node's parentIndex must be an
  // earlier index, which is what makes a cycle structurally impossible.
  parentIndex: number;
}

// A scroll-scrubbed tree: branches grow and nodes fade in as the page
// scrolls through a tall wrapper, with the view zooming out to keep
// pace as more of the tree is revealed.
export interface TreeScrubLesson extends LessonBase {
  type: "treeScrub";
  content: { nodes: TreeScrubNode[] };
}

export interface CustomHtmlLesson extends LessonBase {
  type: "html";
  content: { html: string };
}

export interface EmbedLesson extends LessonBase {
  type: "embed";
  content: { url: string };
}

export interface ExamBreakdownLesson extends LessonBase {
  type: "examBreakdown";
  content: { passMarkPercent: number; timeLimitMinutes: number; questionCount: number; openBook: boolean };
}

export type Lesson =
  | TextLesson
  | VideoLesson
  | QuizLesson
  | PracticalLesson
  | DiagramLesson
  | FlashcardLesson
  | AccordionLesson
  | MatchingLesson
  | DialLesson
  | PipelineLesson
  | PresentationDialLesson
  | CardGridLesson
  | HotspotsLesson
  | TreeScrubLesson
  | CustomHtmlLesson
  | EmbedLesson
  | ExamBreakdownLesson;
export type LessonType = Lesson["type"];

export interface ModuleSeed {
  title: string;
  objective: string;
  authorNotes?: string;
  rawContent?: string;
}

export interface Module {
  moduleId: string;
  // Absent when the module isn't (or is no longer) part of any course - see
  // `category`, which places such a module in the admin library tree instead.
  courseId?: string;
  // Only meaningful when courseId is absent: the category the module was
  // removed from (or created under) via the library.
  category?: string;
  status: ModuleStatus;
  seed: ModuleSeed;
  lessons: Lesson[];
}

export interface ThemeValues {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
}

export type ThemeOverride = Partial<ThemeValues>;

export interface Course {
  courseId: string;
  title: string;
  description?: string;
  category?: string;
  theme: ThemeOverride;
}

export interface LearningPath {
  pathId: string;
  title: string;
  description?: string;
  courseIds: string[];
}

export type UserRole = "student" | "admin" | "super_admin";

export interface User {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  assignedLearningPathIds: string[];
  assignedCourseIds: string[];
  // Absent for a user with no originating voucher (pre-voucher accounts,
  // seeded demo accounts) - such a user never expires.
  memberSince?: number;
  membershipExpiresAt?: number;
}

export type VoucherStatus = "pending" | "registered" | "revoked";

export interface Voucher {
  voucherId: string;
  email: string;
  name: string;
  role: UserRole;
  issuedAt: number;
  expiresAt: number;
  status: VoucherStatus;
  registeredUserId?: string;
  registeredAt?: number;
}

// What GET /api/vouchers/:voucherId (public, unauthenticated - used by the
// register page) returns - never registeredUserId/registeredAt, which
// would leak another user's id to anyone holding an already-used link.
export type PublicVoucher = Omit<Voucher, "registeredUserId" | "registeredAt">;

export type LessonDisplayMode = "vertical" | "carousel" | "accessible";

export type ColorScheme = "light" | "dark";
