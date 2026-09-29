// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { copyToClipboard } from "./clipboard.js";

function stubClipboard(impl: { writeText: (text: string) => Promise<void> } | undefined) {
  Object.defineProperty(navigator, "clipboard", { value: impl, configurable: true });
}

// jsdom (this project's test DOM) doesn't implement execCommand at all, so
// vi.spyOn (which requires the property to already exist) can't be used -
// it's assigned directly instead, same as copyToClipboard itself has to
// treat it as possibly absent rather than just possibly false-returning.
function stubExecCommand(impl: typeof document.execCommand | undefined) {
  Object.defineProperty(document, "execCommand", { value: impl, configurable: true });
}

afterEach(() => {
  stubClipboard(undefined);
  stubExecCommand(undefined);
});

describe("copyToClipboard", () => {
  it("uses navigator.clipboard.writeText when it succeeds", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard({ writeText });
    const execCommand = vi.fn();
    stubExecCommand(execCommand);

    await copyToClipboard("hello");

    expect(writeText).toHaveBeenCalledWith("hello");
    expect(execCommand).not.toHaveBeenCalled();
  });

  it("falls back to execCommand when navigator.clipboard isn't available at all", async () => {
    stubClipboard(undefined);
    const execCommand = vi.fn().mockReturnValue(true);
    stubExecCommand(execCommand);

    await copyToClipboard("hello");

    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("falls back to execCommand when navigator.clipboard.writeText rejects", async () => {
    stubClipboard({ writeText: vi.fn().mockRejectedValue(new Error("denied")) });
    const execCommand = vi.fn().mockReturnValue(true);
    stubExecCommand(execCommand);

    await copyToClipboard("hello");

    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("throws once both the clipboard API and the execCommand fallback have failed", async () => {
    stubClipboard(undefined);
    stubExecCommand(vi.fn().mockReturnValue(false));

    await expect(copyToClipboard("hello")).rejects.toThrow(/couldn't copy/i);
  });

  it("throws cleanly when execCommand isn't implemented at all, rather than an obscure TypeError", async () => {
    stubClipboard(undefined);
    stubExecCommand(undefined);

    await expect(copyToClipboard("hello")).rejects.toThrow(/couldn't copy/i);
  });

  it("removes the temporary textarea it creates for the fallback, success or failure", async () => {
    stubClipboard(undefined);
    stubExecCommand(vi.fn().mockReturnValue(true));

    await copyToClipboard("hello");

    expect(document.querySelector("textarea")).toBeNull();
  });
});
