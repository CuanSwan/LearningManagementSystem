import { z } from "zod";

export const LessonDisplayModeSchema = z.enum(["vertical", "carousel", "accessible"]);
export type LessonDisplayMode = z.infer<typeof LessonDisplayModeSchema>;

export const ColorSchemeSchema = z.enum(["light", "dark"]);
export type ColorScheme = z.infer<typeof ColorSchemeSchema>;
