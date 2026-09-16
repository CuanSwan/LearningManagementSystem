import AdmZip from "adm-zip";

// Rise 360 SCORM exports embed their course data as a jsonp-style call:
//   __jsonp("runtime-data.js","<base64-encoded JSON>");
// inside a file named runtime-data.js (observed at content/runtime-data.js,
// but the path is otherwise matched by filename in case a future export
// nests it differently).
const JSONP_PATTERN = /__jsonp\(\s*"[^"]*"\s*,\s*"([^"]+)"\s*\)/;

export class RiseZipError extends Error {}

export function extractRiseRuntimeData(zipBuffer: Buffer): unknown {
  let zip: AdmZip;
  try {
    zip = new AdmZip(zipBuffer);
  } catch {
    throw new RiseZipError("That file isn't a valid zip archive.");
  }

  const entry = zip.getEntries().find((e) => e.entryName.endsWith("runtime-data.js"));
  if (!entry) {
    throw new RiseZipError("No runtime-data.js found in this zip - it doesn't look like a Rise 360 export.");
  }

  const raw = entry.getData().toString("utf8");
  const match = raw.match(JSONP_PATTERN);
  if (!match) {
    throw new RiseZipError("runtime-data.js didn't have the expected format - Rise may have changed its export format.");
  }

  const decoded = Buffer.from(match[1], "base64").toString("utf8");
  try {
    return JSON.parse(decoded);
  } catch {
    throw new RiseZipError("Couldn't parse the course data inside runtime-data.js.");
  }
}
