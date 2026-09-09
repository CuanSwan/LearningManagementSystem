import type { ThemeOverride } from "./theme.js";

const FONT_KEYWORDS: { pattern: RegExp; fontFamily: string }[] = [
  {
    pattern: /\b(compliance|policy|onboarding|corporate|legal|finance|safety|hr|professional)\b/i,
    fontFamily: "'Merriweather', Georgia, serif",
  },
  {
    pattern: /\b(code|coding|developer|engineering|technical|programming|data|api|software)\b/i,
    fontFamily: "'Fira Code', monospace",
  },
  {
    pattern: /\b(creative|design|workshop|art|writing|storytelling|marketing|brand)\b/i,
    fontFamily: "'Poppins', system-ui, sans-serif",
  },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

/**
 * Deterministic, no-AI theme suggestion derived from a course's own title
 * and description: the accent color comes from hashing the title into a
 * hue (same title always gives the same color, different titles spread
 * out across the color wheel), and a font is only suggested when the text
 * matches a recognizable category - otherwise it's left unset so the
 * course keeps inheriting the site default rather than forcing a guess.
 */
export function suggestTheme(input: { title: string; description?: string }): ThemeOverride {
  const hue = hashString(input.title) % 360;
  const primaryColor = hslToHex(hue, 0.4, 0.32);

  const text = `${input.title} ${input.description ?? ""}`;
  const match = FONT_KEYWORDS.find((keyword) => keyword.pattern.test(text));

  return match ? { primaryColor, fontFamily: match.fontFamily } : { primaryColor };
}
