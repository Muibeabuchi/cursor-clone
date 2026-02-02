import {
  ChevronRightIcon,
  CopyMinusIcon,
  FilePlusCornerIcon,
  FolderPlusIcon,
} from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { Doc } from "convex/_generated/dataModel";
import { Button } from "~/components/ui/button";
import {
  useCreateFile,
  useCreateFolder,
  useFolderContents,
} from "../../hooks/use-file";
import CreateInput from "./create-input";
import { LoadingRow } from "./loading-row";
import { Tree } from "./tree";

export function FileExplorer({ project }: { project: Doc<"projects"> }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [collapseKey, setCollapseKey] = useState(0);
  const [creating, setCreating] = useState<"file" | "folder" | null>(null);

  console.log({ projectId: project._id });

  const { data: folderContents, isLoading } = useFolderContents({
    // parentFolderId,
    projectId: project._id,
    enabled: isExpanded,
  });

  const createFile = useCreateFile();
  const createFolder = useCreateFolder();

  const handleCreate = async (name: string) => {
    setCreating(null);
    if (creating === "file") {
      await createFile.mutateAsync({
        fileName: name,
        content: "",
        parentFolderId: undefined,
        projectId: project._id,
      });
    } else {
      await createFolder.mutateAsync({
        folderName: name,
        parentFolderId: undefined,
        projectId: project._id,
      });
    }
  };

  return (
    <div className="h-full bg-sidebar ">
      <ScrollArea>
        <div
          role="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="group/project flex gap-0.5 items-center h-5.5 bg-accent font-bold cursor-pointer w-full text-left"
        >
          <ChevronRightIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground",
              !isExpanded && "rotate-90",
            )}
          />
          <p className="text-xs uppercase line-clamp-1">{project.name}</p>
          <div className="flex items-center opacity-0 group-hover/project:opacity-100 transition-none ml-auto gap-0.5 duration-0">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCreating("file");
                setIsExpanded(true);
              }}
              variant={"highlight"}
              size={"icon-xs"}
            >
              <FilePlusCornerIcon className="size-3.5" />
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCreating("folder");
                setIsExpanded(true);
              }}
              variant={"highlight"}
              size={"icon-xs"}
            >
              <FolderPlusIcon className="size-3.5" />
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                // reset-collapse
                setCollapseKey((prev) => prev + 1);
              }}
              variant={"highlight"}
              size={"icon-xs"}
            >
              <CopyMinusIcon className="size-3.5" />
            </Button>
          </div>
        </div>
        {isExpanded && (
          <>
            {isLoading && <LoadingRow level={0} className="" />}
            {creating && (
              <CreateInput
                type={creating}
                level={0}
                onSubmit={handleCreate}
                onCancel={() => setCreating(null)}
              />
            )}
          </>
        )}
        {folderContents?.map((item) => (
          <Tree
            key={`${item._id}-${collapseKey}`}
            item={item}
            level={0}
            projectId={project._id}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
