import { Tooltip, EditorView, showTooltip } from "@codemirror/view";
import { EditorState, StateField } from "@codemirror/state";
import { quickEditState, showQuickEditEffect } from "./quick-edit";

let editorView: EditorView | null = null;

const createToolTipForExtension = (state: EditorState): readonly Tooltip[] => {
  const selection = state.selection.main;
  if (selection.empty) {
    return [];
  }
  const isQuickEditActive = state.field(quickEditState);
  if (isQuickEditActive) {
    return [];
  }
  return [
    {
      pos: selection.to,
      above: false,
      strictSide: false,
      create() {
        const dom = document.createElement("div");
        dom.className =
          "bg-popover text-popover-foreground z-50 rounded-sm border border-input p-2 shadow-md flex flex-col gap-2 text-sm";

        const addToChatButton = document.createElement("button");
        addToChatButton.className =
          "font-sans p-1 px-2 text-muted-foreground  hover:bg-foreground/10 rounded-sm";
        addToChatButton.textContent = "Add to chat";
        // addToChatButton.onclick = () => {
        //   if (editorView) {
        //     editorView.dispatch({
        //       effects: showQuickEditEffect.of(true),
        //     });
        //   }
        // };
        const quickEditButton = document.createElement("button");
        quickEditButton.className =
          "font-sans p-1 px-2 text-muted-foreground  hover:bg-foreground/10 rounded-sm";
        const quickEditButtonText = document.createElement("span");
        quickEditButtonText.textContent = "Quick Edit";

        const quickEditButtonShortcut = document.createElement("span");
        quickEditButtonShortcut.textContent = "⌘K";
        quickEditButtonShortcut.className = "text-sm opacity-60";

        quickEditButton.appendChild(quickEditButtonText);
        quickEditButton.appendChild(quickEditButtonShortcut);
        quickEditButton.onclick = () => {
          if (editorView) {
            editorView.dispatch({
              effects: showQuickEditEffect.of(true),
            });
          }
        };
        dom.appendChild(addToChatButton);
        dom.appendChild(quickEditButton);
        return { dom };
      },
    },
  ];
};
const selectiionToolTipField = StateField.define<readonly Tooltip[]>({
  create(state) {
    return createToolTipForExtension(state);
  },
  update(tooltips, transaction) {
    if (transaction.docChanged || transaction.selection) {
      return createToolTipForExtension(transaction.state);
    }
    for (const effect of transaction.effects) {
      if (effect.is(showQuickEditEffect)) {
        return createToolTipForExtension(transaction.state);
      }
    }
    return tooltips;
  },
  provide: (field) =>
    showTooltip.computeN([field], (state) => state.field(field)),
});
const captureViewExtension = EditorView.updateListener.of((update) => {
  editorView = update.view;
});

export const selectionTooltip = () => [
  selectiionToolTipField,
  captureViewExtension,
];
