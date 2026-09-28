// navigator.clipboard.writeText can be missing entirely (a non-secure
// context - plain HTTP, not localhost) or reject (permission denied,
// stricter gesture-timing rules in some browsers) - both fail silently
// with no visible feedback unless the caller handles it. Falls back to the
// older execCommand("copy") path, which works in more of those cases (no
// secure-context requirement), and only throws once both have failed, so
// a caller can show the user something to copy manually as a last resort.
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the legacy path below.
    }
  }

  // Deprecated, but still the broadest-compatibility fallback there is -
  // works without the secure-context requirement navigator.clipboard has.
  // Some environments (this project's own jsdom test DOM included) don't
  // implement it at all, so it's not safe to assume it's callable.
  if (typeof document.execCommand !== "function") {
    throw new Error("Couldn't copy to the clipboard");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  // Off-screen rather than display:none - some browsers refuse to select
  // (and so refuse to copy) an element that isn't actually rendered.
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let succeeded = false;
  try {
    succeeded = document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
  if (!succeeded) {
    throw new Error("Couldn't copy to the clipboard");
  }
}
