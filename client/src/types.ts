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
}

export type LessonDisplayMode = "vertical" | "carousel" | "accessible";

export type ColorScheme = "light" | "dark";
