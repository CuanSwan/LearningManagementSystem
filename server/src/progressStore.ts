import type { Database, DocumentStore } from "./db/index.js";

export interface LastCompleted {
  courseId: string;
  moduleId: string;
}

interface ProgressDoc extends Record<string, unknown> {
  userId: string;
  completedLessonIds: string[];
  lastCompleted?: LastCompleted;
}

let progress: DocumentStore<ProgressDoc>;

export async function initProgressStore(db: Database): Promise<void> {
  progress = await db.createStore<ProgressDoc>("progress", "userId");
}

export async function getCompletedLessons(userId: string): Promise<string[]> {
  const doc = await progress.get(userId);
  return doc?.completedLessonIds ?? [];
}

// Two lessons completing within the same instant - e.g. several
// auto-completing lessons (text, broken/embed video, ...) all mounting at
// once in the vertical list layout - each do their own get-then-set round
// trip against this same per-user document. Left unserialized, the second
// write's `existing` snapshot can predate the first write landing, silently
// dropping one of the two completions (the classic lost-update race).
// Chaining every write for a given user onto the same promise forces them
// to run one at a time, so each one's read always sees the previous one's
// write, no matter how their callers interleave.
const writeQueues = new Map<string, Promise<unknown>>();

function serialized<T>(userId: string, run: () => Promise<T>): Promise<T> {
  const prior = writeQueues.get(userId) ?? Promise.resolve();
  const next = prior.then(run, run);
  writeQueues.set(
    userId,
    next.then(
      () => {},
      () => {}
    )
  );
  return next;
}

export async function setLessonCompletion(userId: string, lessonId: string, completed: boolean): Promise<void> {
  await serialized(userId, async () => {
    const existing = await progress.get(userId);
    const completedLessonIds = new Set(existing?.completedLessonIds ?? []);
    if (completed) completedLessonIds.add(lessonId);
    else completedLessonIds.delete(lessonId);
    await progress.set(userId, { ...existing, userId, completedLessonIds: [...completedLessonIds] });
  });
}

export async function getLastCompleted(userId: string): Promise<LastCompleted | null> {
  const doc = await progress.get(userId);
  return doc?.lastCompleted ?? null;
}

export async function setLastCompleted(userId: string, courseId: string, moduleId: string): Promise<void> {
  await serialized(userId, async () => {
    const existing = await progress.get(userId);
    await progress.set(userId, {
      ...existing,
      userId,
      completedLessonIds: existing?.completedLessonIds ?? [],
      lastCompleted: { courseId, moduleId },
    });
  });
}
