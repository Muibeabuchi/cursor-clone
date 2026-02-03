import { Extension } from "@codemirror/state";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { markdown } from "@codemirror/lang-markdown";
import { json } from "@codemirror/lang-json";

export function getLanguageExtension(fileName: string): Extension {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "py":
      return python();
    case "html":
    case "htm":
      return html();
    case "css":
      return css();
    case "md":
    case "mdx":
      return markdown();
    case "json":
      return json();
    case "js":
      return javascript();
    case "ts":
      return javascript({ typescript: true });
    case "tsx":
      return javascript({ typescript: true, jsx: true });
    case "jsx":
      return javascript({ jsx: true });
    default:
      return javascript({ typescript: true });
  }
}
