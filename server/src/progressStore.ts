import type { Database, DocumentStore } from "./db/index.js";

export interface LastVisited {
  courseId: string;
  moduleId: string;
}

interface ProgressDoc extends Record<string, unknown> {
  userId: string;
  completedLessonIds: string[];
  lastVisited?: LastVisited;
}

let progress: DocumentStore<ProgressDoc>;

export async function initProgressStore(db: Database): Promise<void> {
  progress = await db.createStore<ProgressDoc>("progress", "userId");
}

export async function getCompletedLessons(userId: string): Promise<string[]> {
  const doc = await progress.get(userId);
  return doc?.completedLessonIds ?? [];
}

export async function setLessonCompletion(userId: string, lessonId: string, completed: boolean): Promise<void> {
  const existing = await progress.get(userId);
  const completedLessonIds = new Set(existing?.completedLessonIds ?? []);
  if (completed) completedLessonIds.add(lessonId);
  else completedLessonIds.delete(lessonId);
  await progress.set(userId, { ...existing, userId, completedLessonIds: [...completedLessonIds] });
}

export async function getLastVisited(userId: string): Promise<LastVisited | null> {
  const doc = await progress.get(userId);
  return doc?.lastVisited ?? null;
}

export async function setLastVisited(userId: string, courseId: string, moduleId: string): Promise<void> {
  const existing = await progress.get(userId);
  await progress.set(userId, {
    ...existing,
    userId,
    completedLessonIds: existing?.completedLessonIds ?? [],
    lastVisited: { courseId, moduleId },
  });
}
