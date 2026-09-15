import { z } from "zod";

export const ThemeValuesSchema = z.object({
  primaryColor: z.string(),
  backgroundColor: z.string(),
  fontFamily: z.string(),
});
export type ThemeValues = z.infer<typeof ThemeValuesSchema>;

export const ThemeOverrideSchema = ThemeValuesSchema.partial();
export type ThemeOverride = z.infer<typeof ThemeOverrideSchema>;
