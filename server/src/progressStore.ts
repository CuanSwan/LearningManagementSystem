const completedByUser = new Map<string, Set<string>>();

export function getCompletedLessons(userId: string): string[] {
  return [...(completedByUser.get(userId) ?? [])];
}

export function setLessonCompletion(userId: string, lessonId: string, completed: boolean): void {
  const set = completedByUser.get(userId) ?? new Set<string>();
  if (completed) set.add(lessonId);
  else set.delete(lessonId);
  completedByUser.set(userId, set);
}
