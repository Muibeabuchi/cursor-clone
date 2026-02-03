import { Id } from "convex/_generated/dataModel";
import { useFile, useFilePath } from "~/features/projects/hooks/use-file";
import { useEditor } from "../hooks/use-editor";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";
import { Spinner } from "~/components/ui/spinner";
import { FileIcon } from "@react-symbols/icons/utils";
import { XIcon } from "lucide-react";

const Tab = ({
  fileId,
  isFirst,
  projectId,
}: {
  fileId: Id<"files">;
  isFirst: boolean;
  projectId: Id<"projects">;
}) => {
  const { data: file, isLoading } = useFile({ fileId });
  const { closeTab, activeTabId, previewTabId, openFile, setActiveTab } =
    useEditor(projectId);

  const isActive = activeTabId === fileId;
  const isPreview = previewTabId === fileId;
  const fileName = file?.fileName || "Loading...";

  return (
    <div
      className={cn(
        "flex items-center gap-2 h-8.75 pl-2 pr-1.5 cursor-pointer text-muted-foreground group border-y border-x border-transparent hover:border-accent/30",
        isFirst && "border-l-transparent!",
        isActive &&
          "bg-background text-foreground border-x-border border-b-background -mb-px drop-shadow-2xl",
      )}
      onClick={() => setActiveTab(fileId)}
      onDoubleClick={() => openFile(fileId, { pinned: true })}
    >
      {isLoading ? (
        <Spinner className="text-ring" />
      ) : (
        <FileIcon fileName={fileName} autoAssign className="size-4" />
      )}
      <span
        className={cn(
          "text-sm whitespace-nowrap truncate",
          isPreview && "italic ",
        )}
      >
        {fileName}
      </span>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          closeTab(fileId);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            closeTab(fileId);
          }
        }}
        className={cn(
          "p-0.5 hover:bg-white/10 rounded-sm opacity-0 group-hover:opacity-100",
          isActive && "opacity-100",
        )}
      >
        <XIcon className="size-3" />
      </button>
    </div>
  );
};

export default function TopNavigation({
  projectId,
}: {
  projectId: Id<"projects">;
}) {
  const { activeTabId, openTabs } = useEditor(projectId);
  const { data: filePath } = useFilePath({
    fileId: activeTabId,
  });
  return (
    <ScrollArea className="flex-1">
      <nav className="bg-sidebar flex h-[35px] items-center border-b">
        {openTabs.map((fileId, index) => (
          <Tab
            key={fileId}
            fileId={fileId}
            isFirst={index === 0}
            projectId={projectId}
          />
        ))}
      </nav>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
    // <div className="flex items-center">
    //   <div>{filePath?.map((file) => file.name).join("/")}</div>
    // </div>
  );
}
