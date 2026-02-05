import { EditorView } from "@codemirror/view";

export const customTheme = EditorView.theme({
  "cm-editor": {
    height: "100%",
    fontSize: "14px",
    fontFamily: "var(--font-mono)",
  },
  "cm-gutter": {
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
  },
  "&": {
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    // outline: "none !important",
  },
  "cm-scroller": {
    scrollbarWidth: "thin",
    scrollbarColor: "#3f3f46 transparent",
  },
});
