import { useEditorStore } from "~/features/editor/store/use-editor-store";
import { Id } from "convex/_generated/dataModel";
import { useCallback } from "react";

export const useEditor = (projectId: Id<"projects">) => {
  const editorStore = useEditorStore();
  const tabState = useEditorStore((store) => store.getTabState(projectId));

  const openFile = useCallback(
    (fileId: Id<"files">, options: { pinned: boolean }) => {
      editorStore.openFile(projectId, fileId, options);
    },
    [editorStore, projectId],
  );

  const closeTab = useCallback(
    (fileId: Id<"files">) => {
      editorStore.closeTab(projectId, fileId);
    },
    [editorStore, projectId],
  );

  const closeAllTabs = useCallback(() => {
    editorStore.closeAllTabs(projectId);
  }, [editorStore, projectId]);

  const setActiveTab = useCallback(
    (fileId: Id<"files">) => {
      editorStore.setActiveTab(projectId, fileId);
    },
    [editorStore, projectId],
  );

  return {
    ...tabState,
    openFile,
    closeTab,
    closeAllTabs,
    setActiveTab,
  };
};
