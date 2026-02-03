import { Id } from "convex/_generated/dataModel";
import TopNavigation from "./top-navigation";
import { useEditor } from "../hooks/use-editor";
import FileBreadCrumbs from "./file-bread-crumbs";
import { useFile } from "~/features/projects/hooks/use-file";
import { CodeEditor } from "./code-editor";

export default function EditorView({
  projectId,
}: {
  projectId: Id<"projects">;
}) {
  const { activeTabId } = useEditor(projectId);
  const { data: activeFileData } = useFile({ fileId: activeTabId });
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
        {activeFileData && <CodeEditor fileName={activeFileData.fileName} />}
      </div>
    </div>
  );
}
