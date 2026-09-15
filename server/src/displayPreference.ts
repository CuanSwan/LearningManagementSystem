import { z } from "zod";

export const LessonDisplayModeSchema = z.enum(["vertical", "carousel", "accessible"]);
export type LessonDisplayMode = z.infer<typeof LessonDisplayModeSchema>;
