import { readdir, readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { isAllowedImageType, saveUploadedImage } from "./uploads.js";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "uploads-test-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("isAllowedImageType", () => {
  it("accepts the common raster image types", () => {
    expect(isAllowedImageType("image/png")).toBe(true);
    expect(isAllowedImageType("image/jpeg")).toBe(true);
    expect(isAllowedImageType("image/gif")).toBe(true);
    expect(isAllowedImageType("image/webp")).toBe(true);
  });

  it("rejects svg - it can carry executable script content unlike a raster image", () => {
    expect(isAllowedImageType("image/svg+xml")).toBe(false);
  });

  it("rejects a non-image type", () => {
    expect(isAllowedImageType("application/pdf")).toBe(false);
  });
});

describe("saveUploadedImage", () => {
  it("writes the buffer to disk under a generated filename with the right extension", async () => {
    const url = await saveUploadedImage(dir, Buffer.from("fake-png-bytes"), "image/png");
    expect(url).toMatch(/^\/api\/uploads\/[0-9a-f-]+\.png$/);

    const filename = url.split("/").pop()!;
    const written = await readFile(path.join(dir, filename));
    expect(written.toString()).toBe("fake-png-bytes");
  });

  it("gives two uploads distinct filenames even with identical content", async () => {
    const urlA = await saveUploadedImage(dir, Buffer.from("same"), "image/jpeg");
    const urlB = await saveUploadedImage(dir, Buffer.from("same"), "image/jpeg");
    expect(urlA).not.toBe(urlB);
    expect(await readdir(dir)).toHaveLength(2);
  });

  it("creates the target directory if it doesn't exist yet", async () => {
    const nested = path.join(dir, "does", "not", "exist", "yet");
    const url = await saveUploadedImage(nested, Buffer.from("x"), "image/webp");
    expect(await readdir(nested)).toContain(url.split("/").pop());
  });

  it("rejects an unsupported mime type without writing anything", async () => {
    await expect(saveUploadedImage(dir, Buffer.from("x"), "image/svg+xml")).rejects.toThrow(/Unsupported image type/);
    await expect(readdir(dir)).resolves.toEqual([]);
  });
});
