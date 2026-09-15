import type { CSSProperties } from "react";
import type { ThemeOverride, ThemeValues } from "./types.js";

export const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: "System sans (default)", value: "system-ui, sans-serif" },
  { label: "Merriweather (serif)", value: "'Merriweather', Georgia, serif" },
  { label: "Poppins (geometric sans)", value: "'Poppins', system-ui, sans-serif" },
  { label: "Fira Code (monospace)", value: "'Fira Code', monospace" },
];

const GLOBAL_DEFAULT_VALUES: ThemeValues = {
  primaryColor: "#3e6259",
  backgroundColor: "#f6f5f1",
  fontFamily: "'Poppins', sans-serif",
};

/**
 * A resolved, fully-specified theme. Course themes are stored as partial
 * overrides (ThemeOverride) - Theme.default().withOverrides(...) is how a
 * global default and a course's stipulated overrides get merged into the
 * concrete values a page actually renders with.
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

export function themeStyle(theme: Theme): CSSProperties {
  return theme.toCssVariables() as CSSProperties;
}
