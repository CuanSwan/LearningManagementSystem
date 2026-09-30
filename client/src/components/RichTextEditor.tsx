import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import { FontSize, LineHeight, WordSpacing } from "../richTextExtensions.js";

type HeadingLevel = 2 | 3 | 4;

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];
const LINE_HEIGHTS = ["1", "1.15", "1.5", "2"];
const WORD_SPACINGS = ["2px", "4px", "8px"];
const DEFAULT_FONT_COLOR = "#1a1a1a";

// The markup editor behind the "text" lesson type - produces sanitized HTML
// (headings, lists, emphasis, links) instead of the plain string the old
// textarea produced. Sanitization itself happens server-side on save (see
// TextContentSchema) and again at render time (TextLesson.tsx) - this
// component's job is just authoring, not enforcing safety.
export function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const [showSource, setShowSource] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      TextStyle,
      Color,
      FontSize,
      WordSpacing,
      LineHeight,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keeps the editor in sync if `value` ever changes from outside (e.g. a
  // library block swapped in) - a no-op most of the time since onUpdate
  // already keeps `value` matching the editor's own output.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  function setBlockStyle(style: string) {
    if (style === "paragraph") {
      editor!.chain().focus().setParagraph().run();
    } else {
      editor!
        .chain()
        .focus()
        .toggleHeading({ level: Number(style) as HeadingLevel })
        .run();
    }
  }

  function setLink() {
    const previousUrl = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "");
    if (url === null) return;
    const chain = editor!.chain().focus().extendMarkRange("link");
    if (url === "") chain.unsetLink().run();
    else chain.setLink({ href: url }).run();
  }

  function setFontSize(size: string) {
    if (size === "") editor!.chain().focus().unsetFontSize().run();
    else editor!.chain().focus().setFontSize(size).run();
  }

  function setLineHeight(height: string) {
    if (height === "") editor!.chain().focus().unsetLineHeight().run();
    else editor!.chain().focus().setLineHeight(height).run();
  }

  function setWordSpacing(spacing: string) {
    if (spacing === "") editor!.chain().focus().unsetWordSpacing().run();
    else editor!.chain().focus().setWordSpacing(spacing).run();
  }

  const currentBlockStyle = ([2, 3, 4] as HeadingLevel[]).find((level) => editor.isActive("heading", { level }));
  const currentFontSize = (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "";
  const currentLineHeight =
    ((editor.getAttributes("paragraph").lineHeight ?? editor.getAttributes("heading").lineHeight) as string | undefined) ?? "";
  const currentWordSpacing = (editor.getAttributes("textStyle").wordSpacing as string | undefined) ?? "";
  const currentFontColor = (editor.getAttributes("textStyle").color as string | undefined) ?? DEFAULT_FONT_COLOR;

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar" role="toolbar" aria-label="Text formatting">
        <select
          value={currentBlockStyle ?? "paragraph"}
          onChange={(e) => setBlockStyle(e.target.value)}
          aria-label="Paragraph style"
        >
          <option value="paragraph">Paragraph</option>
          <option value="2">Heading</option>
          <option value="3">Subheading</option>
          <option value="4">Sub-subheading</option>
        </select>
        <select value={currentFontSize} onChange={(e) => setFontSize(e.target.value)} aria-label="Font size">
          <option value="">Font size</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <label className="rich-text-color-field">
          <span className="sr-only">Font color</span>
          <input
            type="color"
            value={currentFontColor}
            onChange={(e) => editor!.chain().focus().setColor(e.target.value).run()}
            aria-label="Font color"
          />
        </label>
        <button
          type="button"
          onClick={() => editor!.chain().focus().unsetColor().run()}
          aria-label="Reset font color"
          title="Reset font color"
        >
          &#8635;
        </button>
        <select value={currentLineHeight} onChange={(e) => setLineHeight(e.target.value)} aria-label="Line spacing">
          <option value="">Line spacing</option>
          {LINE_HEIGHTS.map((height) => (
            <option key={height} value={height}>
              {height}
            </option>
          ))}
        </select>
        <select value={currentWordSpacing} onChange={(e) => setWordSpacing(e.target.value)} aria-label="Word spacing">
          <option value="">Word spacing</option>
          {WORD_SPACINGS.map((spacing) => (
            <option key={spacing} value={spacing}>
              {spacing}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={editor.isActive("bold") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBold().run()}
          aria-label="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={editor.isActive("italic") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={editor.isActive("underline") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Underline"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          className={editor.isActive("bulletList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Bullet list"
        >
          &bull; List
        </button>
        <button
          type="button"
          className={editor.isActive("orderedList") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Numbered list"
        >
          1. List
        </button>
        <button
          type="button"
          className={editor.isActive("blockquote") ? "active" : ""}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Quote"
        >
          &ldquo;&rdquo;
        </button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} aria-label="Horizontal rule">
          &mdash;
        </button>
        <button type="button" className={editor.isActive("link") ? "active" : ""} onClick={setLink} aria-label="Link">
          Link
        </button>
        <button type="button" onClick={() => editor.chain().focus().undo().run()} aria-label="Undo">
          &#8630;
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} aria-label="Redo">
          &#8631;
        </button>
        <button
          type="button"
          className={showSource ? "active" : ""}
          onClick={() => setShowSource((v) => !v)}
          aria-label="View HTML source"
        >
          &lt;/&gt;
        </button>
      </div>
      {showSource ? (
        <textarea
          className="rich-text-source"
          rows={6}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            editor.commands.setContent(e.target.value, { emitUpdate: false });
          }}
        />
      ) : (
        <EditorContent editor={editor} className="rich-text-content" />
      )}
    </div>
  );
}
