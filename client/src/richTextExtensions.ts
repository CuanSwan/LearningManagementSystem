import { Extension, type CommandProps } from "@tiptap/core";

// TipTap ships an official extension for font color (Color, applied to the
// TextStyle mark) but not for font size or word spacing - these follow the
// same documented pattern (a global attribute on the "textStyle" mark,
// rendered as an inline style) rather than inventing a new mark each.
// Both are per-character like color/bold, unlike line height below.

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
    wordSpacing: {
      setWordSpacing: (spacing: string) => ReturnType;
      unsetWordSpacing: () => ReturnType;
    };
    lineHeight: {
      setLineHeight: (height: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

export const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => (attributes.fontSize ? { style: `font-size: ${attributes.fontSize}` } : {}),
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

export const WordSpacing = Extension.create({
  name: "wordSpacing",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          wordSpacing: {
            default: null,
            parseHTML: (element) => element.style.wordSpacing || null,
            renderHTML: (attributes) => (attributes.wordSpacing ? { style: `word-spacing: ${attributes.wordSpacing}` } : {}),
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setWordSpacing:
        (spacing: string) =>
        ({ chain }) =>
          chain().setMark("textStyle", { wordSpacing: spacing }).run(),
      unsetWordSpacing:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { wordSpacing: null }).removeEmptyTextStyle().run(),
    };
  },
});

// Line height is a block-level property (it applies to a whole paragraph,
// not a run of characters) - a global attribute on the block nodes
// themselves rather than the textStyle mark, same idea TipTap's own
// TextAlign extension uses for a block-level property.
export const LineHeight = Extension.create({
  name: "lineHeight",
  addOptions() {
    return { types: ["paragraph", "heading"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) => (attributes.lineHeight ? { style: `line-height: ${attributes.lineHeight}` } : {}),
          },
        },
      },
    ];
  },
  addCommands() {
    // Applied to every block node the current selection touches (same idea
    // as TipTap's own TextAlign extension) - a collapsed cursor still
    // touches the one paragraph/heading it's in, so clicking a line-height
    // option with no text selected still affects the paragraph you're in.
    const applyToSelection = (height: string | null) =>
      ({ tr, state, dispatch }: CommandProps) => {
        const { selection } = state;
        let applied = false;
        state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
          if (this.options.types.includes(node.type.name)) {
            if (dispatch) tr.setNodeAttribute(pos, "lineHeight", height);
            applied = true;
          }
        });
        return applied;
      };

    return {
      setLineHeight:
        (height: string) =>
        (props) =>
          applyToSelection(height)(props),
      unsetLineHeight:
        () =>
        (props) =>
          applyToSelection(null)(props),
    };
  },
});
