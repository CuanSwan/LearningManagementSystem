import { z } from "zod";

export const ThemeValuesSchema = z.object({
  primaryColor: z.string(),
  backgroundColor: z.string(),
  fontFamily: z.string(),
});
export type ThemeValues = z.infer<typeof ThemeValuesSchema>;

export const ThemeOverrideSchema = ThemeValuesSchema.partial();
export type ThemeOverride = z.infer<typeof ThemeOverrideSchema>;

const GLOBAL_DEFAULT_VALUES: ThemeValues = {
  primaryColor: "#3e6259",
  backgroundColor: "#f6f5f1",
  fontFamily: "'Poppins', sans-serif",
};

/**
 * A resolved, fully-specified theme. Course themes are stored as partial
 * overrides (see ThemeOverrideSchema) - Theme.default().withOverrides(...)
 * is how a global default and a course's stipulated overrides get merged
 * into the concrete values a page actually renders with.
 */
export class Theme {
  readonly primaryColor: string;
  readonly backgroundColor: string;
  readonly fontFamily: string;

  constructor(values: ThemeValues) {
    this.primaryColor = values.primaryColor;
    this.backgroundColor = values.backgroundColor;
    this.fontFamily = values.fontFamily;
  }

  static default(): Theme {
    return new Theme(GLOBAL_DEFAULT_VALUES);
  }

  withOverrides(override?: ThemeOverride): Theme {
    if (!override) return this;
    return new Theme({
      primaryColor: override.primaryColor ?? this.primaryColor,
      backgroundColor: override.backgroundColor ?? this.backgroundColor,
      fontFamily: override.fontFamily ?? this.fontFamily,
    });
  }

  toCssVariables(): Record<string, string> {
    return {
      "--theme-primary": this.primaryColor,
      "--theme-bg": this.backgroundColor,
      "--theme-font": this.fontFamily,
    };
  }
}
