// The link an admin pastes into a Thinkific Multimedia Lesson's embed block
// (with "Add dynamic variables to the URL" turned on) - {{email}} is left
// as Thinkific's own placeholder, substituted with the viewing student's
// email when Thinkific renders the page. See server/src/index.ts's
// /api/embed for what the LMS does with it.
export function buildEmbedLink(origin: string, courseId: string, moduleId: string): string {
  return `${origin}/embed/courses/${courseId}/modules/${moduleId}?email={{email}}`;
}
