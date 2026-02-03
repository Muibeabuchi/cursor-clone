import { useEffect, useMemo, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "codemirror";
import { customTheme } from "../extensions/theme";
import { getLanguageExtension } from "../extensions/language-extension";
import { minimap } from "../extensions/minimap";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { customSetup } from "../extensions/custom-setup";

interface fileName {
  fileName: string;
}

export function CodeEditor({ fileName }: fileName) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);

  const languageExtension = useMemo(
    () => getLanguageExtension(fileName),
    [fileName],
  );

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: "// Start typing...",
      extensions: [
        keymap.of(defaultKeymap),
        keymap.of([indentWithTab]),
        minimap(),
        customSetup,
        languageExtension,
        customTheme,
        oneDark,
        indentationMarkers(),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  return (
    <div
      ref={editorRef}
      style={{ height: "100%", width: "100%" }}
      className="pl-4 bg-background"
    />
  );
}
