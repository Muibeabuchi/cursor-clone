import { Doc, Id } from "convex/_generated/dataModel";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  useCreateFile,
  useCreateFolder,
  useFolderContents,
  useUpdateFile,
  useDeleteFile,
} from "../../hooks/use-file";
import { getPadding } from "./constants";
import { LoadingRow } from "./loading-row";
// import { CreateInput } from "./create-input";
import { useState } from "react";
import { FileType } from "convex/schema";
import { TreeItemWrapper } from "./tree-item-wrapper";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";

export function Tree({
  item,
  level = 0,
  projectId,
}: {
  item: Doc<"files">;
  level?: number;
  projectId: Id<"projects">;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [creating, setCreating] = useState<FileType | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  const createFile = useCreateFile();
  const createFolder = useCreateFolder();
  const updateFile = useUpdateFile();
  const deleteFile = useDeleteFile();

  const folderContents = useFolderContents({
    parentFolderId: item._id,
    projectId,
    enabled: item.fileType === "folder" && isOpen,
  });

  const startCreating = (type: FileType) => {
    setIsOpen(true);
    setCreating(type);
  };

  const stopCreating = () => {
    setIsOpen(false);
    setCreating(null);
  };

  if (item.fileType === "folder") {
    const folderName = item.fileName;
    return (
      <>
        <TreeItemWrapper
          item={item}
          level={level}
          onClick={() => {}}
          onDelete={() =>
            // close tab
            deleteFile.mutate({
              fileId: item._id,
            })
          }
          onDoubleClick={() => {}}
          onRename={() => setIsRenaming(true)}
          onCreateFile={() => startCreating("file")}
          onCreateFolder={() => startCreating("folder")}
          projectId={projectId}
          isActive={false}
        >
          <>
            <div className="flex items-center gap-0.5">
              <ChevronRightIcon
                className={cn(
                  "size-4 shrink-0 text-muted-foreground",
                  isOpen && "rotate-90",
                )}
              />
              <FolderIcon className="size-4" folderName={folderName} />
            </div>
            <span className="truncate text-sm">{folderName}</span>
          </>
        </TreeItemWrapper>
      </>
    );
  }

  //   if (item.fileType === "file") {
  const fileName = item.fileName;
  return (
    <TreeItemWrapper
      item={item}
      level={level}
      onClick={() => {}}
      onDelete={() =>
        // close tab
        deleteFile.mutate({
          fileId: item._id,
        })
      }
      onDoubleClick={() => {}}
      onRename={() => setIsRenaming(true)}
      projectId={projectId}
      isActive={false}
      // onCreateFile={() => setCreating("file")}
      // onCreateFolder={() => setCreating("folder")}
    >
      <FileIcon className="size-4" fileName={fileName} />
      <span className="truncate">{fileName}</span>
    </TreeItemWrapper>
  );
  //   }
}
