import type { Theme } from "@lms/shared";
import type { CSSProperties } from "react";

export const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: "System sans (default)", value: "system-ui, sans-serif" },
  { label: "Merriweather (serif)", value: "'Merriweather', Georgia, serif" },
  { label: "Poppins (geometric sans)", value: "'Poppins', system-ui, sans-serif" },
  { label: "Fira Code (monospace)", value: "'Fira Code', monospace" },
];

export function themeStyle(theme: Theme): CSSProperties {
  return theme.toCssVariables() as CSSProperties;
}
