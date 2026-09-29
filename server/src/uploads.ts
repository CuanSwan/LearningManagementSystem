import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

// SVG is deliberately excluded - unlike a raster format, an SVG file can
// embed <script>/event-handler markup that would execute in whatever
// context it's later opened in, so "just an image" isn't actually a safe
// assumption for it the way it is for the formats below.
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

export function isAllowedImageType(mimetype: string): boolean {
  return mimetype in ALLOWED_IMAGE_TYPES;
}

// Saves an already-validated image buffer to `dir` under a random filename
// - never the client-supplied one, which sidesteps any path-traversal or
// filename-collision concern entirely rather than trying to sanitize it -
// and returns the path it's served at (see the /api/uploads static mount
// in index.ts). `dir` is a parameter rather than read from process.env
// here, the same way createFileStore takes its directory explicitly -
// keeps this callable directly against a throwaway temp dir in tests.
export async function saveUploadedImage(dir: string, buffer: Buffer, mimetype: string): Promise<string> {
  const ext = ALLOWED_IMAGE_TYPES[mimetype];
  if (!ext) {
    throw new Error(`Unsupported image type: ${mimetype}`);
  }
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, filename), buffer);
  return `/api/uploads/${filename}`;
}
