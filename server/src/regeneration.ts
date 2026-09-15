import type { Lesson } from "./schemas.js";

/**
 * Whether a future AI regeneration pass is allowed to overwrite this lesson.
 * Official wording is protected regardless of who wrote it, and any
 * human-authored lesson is protected regardless of wording style.
 */
export function canRegenerate(lesson: Lesson): boolean {
  return lesson.source === "ai_generated" && lesson.wordingStyle !== "official";
}
