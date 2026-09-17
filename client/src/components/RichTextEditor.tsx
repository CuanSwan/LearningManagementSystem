import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";

type HeadingLevel = 2 | 3 | 4;

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

  const currentBlockStyle = ([2, 3, 4] as HeadingLevel[]).find((level) => editor.isActive("heading", { level }));

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
