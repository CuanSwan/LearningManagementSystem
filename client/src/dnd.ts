export const NEW_LESSON_MIME = "application/x-lms-new-lesson-type";
export const EXISTING_LESSON_MIME = "application/x-lms-existing-lesson-id";
export const SAVED_LESSON_MIME = "application/x-lms-saved-lesson-id";
// Carries a full lesson (as JSON) copied from the course library tree - the
// drop handler clones it with a fresh lessonId rather than moving the
// original, since it still belongs to its own course/module.
export const LIBRARY_LESSON_MIME = "application/x-lms-library-lesson-json";
// Carries a course's id from the admin board (see AdminBoard.tsx) as it's
// dragged between status/stage columns.
export const BOARD_COURSE_MIME = "application/x-lms-board-course-id";
