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

export type Lesson = TextLesson | VideoLesson | QuizLesson | PracticalLesson | DiagramLesson;
export type LessonType = Lesson["type"];

export interface ModuleSeed {
  title: string;
  objective: string;
  authorNotes?: string;
  rawContent?: string;
}

export interface Module {
  moduleId: string;
  courseId: string;
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
}

export type LessonDisplayMode = "vertical" | "carousel" | "accessible";
