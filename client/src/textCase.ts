// Capitalizes the first letter of every word, leaving the rest of each
// word untouched - preserves acronyms and intentional internal casing
// (e.g. "BATNA", "API") instead of forcing them to lowercase.
export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}
