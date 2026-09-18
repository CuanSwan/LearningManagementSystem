// YouTube and Vimeo serve an HTML player page at their normal share/watch
// URLs, not a raw video stream - a <video src> tag can't play those (it
// tries to load the page as a media file and just fails silently). This
// detects that case and produces the URL their <iframe> embed actually
// expects, so externally-hosted video works and its bandwidth stays off
// our own hosting.
export function toEmbedUrl(videoUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(videoUrl);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");

  if (host === "youtube.com") {
    if (url.pathname.startsWith("/embed/")) return url.toString();
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  }
  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === "player.vimeo.com") {
    return url.toString();
  }
  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}
