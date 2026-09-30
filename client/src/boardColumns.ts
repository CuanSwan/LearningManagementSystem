import type { Course, CourseStage } from "./types.js";

// The board's columns, left to right - a course's status/stage put it in
// exactly one. "published" isn't a CourseStage value (that only tracks
// pre-publish progress); it's its own column driven by course.status
// instead, so a published course always lands here regardless of whatever
// stage it was last left in.
export type BoardColumnId = CourseStage | "published";

export const BOARD_COLUMNS: { id: BoardColumnId; title: string; hint: string }[] = [
  { id: "planned", title: "Needs to be Made", hint: "Planned, not started yet" },
  { id: "in_progress", title: "In Progress", hint: "Actively being built" },
  { id: "in_review", title: "In Review", hint: "Submitted for review" },
  { id: "ready", title: "Ready to Publish", hint: "Reviewed and approved" },
  { id: "published", title: "Published", hint: "Live for assigned students" },
];

export function columnForCourse(course: Course): BoardColumnId {
  return course.status === "published" ? "published" : course.stage;
}

export function groupCoursesByColumn(courses: Course[]): Record<BoardColumnId, Course[]> {
  const grouped = Object.fromEntries(BOARD_COLUMNS.map((c) => [c.id, [] as Course[]])) as Record<BoardColumnId, Course[]>;
  for (const course of courses) {
    grouped[columnForCourse(course)].push(course);
  }
  return grouped;
}

// What moving a card into a given column should do to the underlying course.
// Dropping into Published actually publishes it; dropping a published course
// back into any other column un-publishes it (status: "draft") and records
// that column as its new stage.
export function patchForColumn(columnId: BoardColumnId): { status: Course["status"]; stage: CourseStage } {
  if (columnId === "published") return { status: "published", stage: "ready" };
  return { status: "draft", stage: columnId };
}
