import { describe, expect, it } from "vitest";
import { toEmbedUrl } from "./videoEmbed.js";

describe("toEmbedUrl", () => {
  it("passes an already-correct YouTube embed URL through unchanged", () => {
    expect(toEmbedUrl("https://www.youtube.com/embed/YMz1I9kb15w")).toBe("https://www.youtube.com/embed/YMz1I9kb15w");
  });

  it("converts a YouTube watch URL into its embed form", () => {
    expect(toEmbedUrl("https://www.youtube.com/watch?v=YMz1I9kb15w")).toBe("https://www.youtube.com/embed/YMz1I9kb15w");
  });

  it("converts a youtu.be short link into an embed URL", () => {
    expect(toEmbedUrl("https://youtu.be/YMz1I9kb15w")).toBe("https://www.youtube.com/embed/YMz1I9kb15w");
  });

  it("passes an already-correct Vimeo player URL through unchanged", () => {
    expect(toEmbedUrl("https://player.vimeo.com/video/76979871")).toBe("https://player.vimeo.com/video/76979871");
  });

  it("converts a vimeo.com share URL into its player embed form", () => {
    expect(toEmbedUrl("https://vimeo.com/76979871")).toBe("https://player.vimeo.com/video/76979871");
  });

  it("returns null for a direct self-hosted video file, leaving it to <video src>", () => {
    expect(toEmbedUrl("https://example.com/videos/lesson1.mp4")).toBeNull();
  });

  it("returns null for an invalid URL instead of throwing", () => {
    expect(toEmbedUrl("not a url")).toBeNull();
  });

  it("returns null for a vimeo.com URL with a non-numeric path (not a video id)", () => {
    expect(toEmbedUrl("https://vimeo.com/channels/staffpicks")).toBeNull();
  });
});
