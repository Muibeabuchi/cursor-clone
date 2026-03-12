import { Id } from "convex/_generated/dataModel";
import TopNavigation from "./top-navigation";
import { useEditor } from "../hooks/use-editor";
import FileBreadCrumbs from "./file-bread-crumbs";
import { useFile, useUpdateFile } from "~/features/projects/hooks/use-file";
import { CodeEditor } from "./code-editor";
import { useEffect, useRef } from "react";
import { AlertTriangleIcon } from "lucide-react";

const DEBOUNCE_TIME = 2000;

export default function EditorView({
  projectId,
}: {
  projectId: Id<"projects">;
}) {
  const updateFileTimeout = useRef<NodeJS.Timeout | null>(null);
  const { activeTabId } = useEditor(projectId);
  const { data: activeFileData } = useFile({ fileId: activeTabId });
  const { mutate: updateFile } = useUpdateFile();

  useEffect(() => {
    return () => {
      if (updateFileTimeout.current) {
        clearTimeout(updateFileTimeout.current);
      }
    };
  }, [activeFileData]);

  const isActiveFileBinary = activeFileData && activeFileData?.storageId;
  const isActiveFileText = activeFileData && !activeFileData?.storageId;
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center">
        <TopNavigation projectId={projectId} />
      </div>
      {activeTabId && <FileBreadCrumbs projectId={projectId} />}
      <div className="flex-1 min-h-0 bg-background">
        {!activeFileData && (
          <div className="flex size-full items-center justify-center ">
            <img
              src="/logo.svg"
              alt="koda"
              width={50}
              height={50}
              className="opacity-25"
            />
          </div>
        )}
        {isActiveFileText && (
          <CodeEditor
            key={activeFileData._id}
            fileName={activeFileData.fileName}
            initialValue={activeFileData.content}
            onChange={(value) => {
              if (updateFileTimeout.current) {
                clearTimeout(updateFileTimeout.current);
              }
              updateFileTimeout.current = setTimeout(() => {
                updateFile({ content: value, fileId: activeFileData._id });
              }, DEBOUNCE_TIME);
            }}
          />
        )}
        {isActiveFileBinary && (
          <div className="flex size-full items-center justify-center ">
            <div className="flex  flex-col gap-2.5 items-center max-w-md text-center">
              <AlertTriangleIcon className="size-10 text-yellow-500" />
              <p className="text-sm text-muted-foreground">
                The file is not displayed in the editor because it is either
                binary or uses an unsupported text encoding.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
