import type { Database, DocumentStore } from "./db/index.js";
import type { ColorScheme, LessonDisplayMode } from "./displayPreference.js";

interface PreferenceDoc extends Record<string, unknown> {
  userId: string;
  lessonDisplayMode?: LessonDisplayMode;
  colorScheme?: ColorScheme;
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
  const existing = await preferences.get(userId);
  await preferences.set(userId, { ...existing, userId, lessonDisplayMode: mode });
}

export async function getColorScheme(userId: string): Promise<ColorScheme | null> {
  const doc = await preferences.get(userId);
  return doc?.colorScheme ?? null;
}

export async function setColorScheme(userId: string, scheme: ColorScheme): Promise<void> {
  const existing = await preferences.get(userId);
  await preferences.set(userId, { ...existing, userId, colorScheme: scheme });
}
