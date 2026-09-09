export type LessonDisplayMode = "vertical" | "carousel";

const preferenceByUser = new Map<string, LessonDisplayMode>();

export function getLessonDisplayMode(userId: string): LessonDisplayMode | null {
  return preferenceByUser.get(userId) ?? null;
}

export function setLessonDisplayMode(userId: string, mode: LessonDisplayMode): void {
  preferenceByUser.set(userId, mode);
}
