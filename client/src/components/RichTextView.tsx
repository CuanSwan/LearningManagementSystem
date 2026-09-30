import DOMPurify from "dompurify";

// Renders HTML produced by RichTextEditor. Sanitized at render time (not
// just on save) so every rendering path is protected the same way
// regardless of how the markup got into storage - same reasoning as
// TextLesson/CustomHtmlLesson, which this factors out. Defaults to a <div>
// rather than <p> since the sanitized markup can itself contain block
// elements (paragraphs, headings, lists), which can't nest inside a <p>.
export function RichTextView({ html, className, as: Tag = "div" }: { html: string; className?: string; as?: "div" | "span" }) {
  const clean = DOMPurify.sanitize(html);
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
