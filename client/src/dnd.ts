export const NEW_LESSON_MIME = "application/x-lms-new-lesson-type";
export const EXISTING_LESSON_MIME = "application/x-lms-existing-lesson-id";
export const SAVED_LESSON_MIME = "application/x-lms-saved-lesson-id";
// Carries a full lesson (as JSON) copied from the course library tree - the
// drop handler clones it with a fresh lessonId rather than moving the
// original, since it still belongs to its own course/module.
export const LIBRARY_LESSON_MIME = "application/x-lms-library-lesson-json";
// Carries a full lesson (as JSON) pulled from the cross-module lesson
// clipboard (see lessonClipboard.ts) - unlike LIBRARY_LESSON_MIME, the drop
// handler keeps the lesson's own lessonId instead of minting a new one: this
// is actually moving the lesson (its id may already have student progress
// recorded against it elsewhere), not duplicating it.
export const CLIPBOARD_LESSON_MIME = "application/x-lms-clipboard-lesson-json";
