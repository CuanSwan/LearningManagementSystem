import type { Database, DocumentStore } from "./db/index.js";
import type { LessonDisplayMode } from "./displayPreference.js";

interface PreferenceDoc extends Record<string, unknown> {
  userId: string;
  lessonDisplayMode: LessonDisplayMode;
}

let preferences: DocumentStore<PreferenceDoc>;

export async function initPreferencesStore(db: Database): Promise<void> {
  preferences = await db.createStore<PreferenceDoc>("preferences", "userId");
}

export async function getLessonDisplayMode(userId: string): Promise<LessonDisplayMode | null> {
  const doc = await preferences.get(userId);
  return doc?.lessonDisplayMode ?? null;
}

export async function setLessonDisplayMode(userId: string, mode: LessonDisplayMode): Promise<void> {
  await preferences.set(userId, { userId, lessonDisplayMode: mode });
}
