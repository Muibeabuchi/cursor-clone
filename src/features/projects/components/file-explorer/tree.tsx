import { Doc, Id } from "convex/_generated/dataModel";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  useCreateFile,
  useCreateFolder,
  useFolderContents,
  useUpdateFile,
  useDeleteFile,
  useRenameFile,
} from "../../hooks/use-file";
import { getPadding } from "./constants";
import { LoadingRow } from "./loading-row";
// import { CreateInput } from "./create-input";
import { useState } from "react";
import { FileType } from "convex/schema";
import { TreeItemWrapper } from "./tree-item-wrapper";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";
import CreateInput from "./create-input";

import RenameInput from "./rename-input";
import { useEditor } from "~/features/editor/hooks/use-editor";

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
  const renameFile = useRenameFile();

  const { openFile, closeTab, closeAllTabs, activeTabId } =
    useEditor(projectId);

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

  const handleCreate = (name: string) => {
    if (creating === "file") {
      createFile.mutate({
        fileName: name,
        content: "",
        parentFolderId: item._id,
        projectId,
      });
    } else {
      createFolder.mutate({
        folderName: name,
        parentFolderId: item._id,
        projectId,
      });
    }
    setCreating(null);
    // stopCreating();
  };

  const handleRename = (name: string) => {
    setIsRenaming(false);
    if (name === item.fileName) {
      return;
    }

    renameFile.mutate({
      fileId: item._id,
      newFileName: name,
      projectId,
      parentFolderId: item.parentId,
    });
  };

  const FolderContent = (
    <>
      <div className="flex items-center gap-0.5">
        <ChevronRightIcon
          className={cn(
            "size-4 shrink-0 text-muted-foreground",
            isOpen && "rotate-90",
          )}
        />
        <FolderIcon className="size-4" folderName={item.fileName} />
      </div>
      <span className="truncate text-sm">{item.fileName}</span>
    </>
  );

  if (creating) {
    return (
      <>
        <button
          className="group flex items-center gap-1 h-5.5 hover:bg-accent/30 w-full"
          onClick={() => setIsOpen((val) => !val)}
          style={{ paddingLeft: getPadding({ level, isFile: false }) }}
        >
          {FolderContent}
        </button>
        {isOpen && folderContents.isLoading ? (
          <LoadingRow level={level + 1} />
        ) : (
          <>
            <CreateInput
              type={creating}
              level={level + 1}
              onSubmit={(name) => handleCreate(name)}
              onCancel={stopCreating}
            />
          </>
        )}

        {isOpen &&
          !folderContents.isLoading &&
          folderContents.data?.map((child) => (
            <Tree
              key={child._id}
              item={child}
              level={level + 1}
              projectId={projectId}
            />
          ))}
      </>
    );
  }

  if (item.fileType === "folder") {
    if (isRenaming) {
      return (
        <>
          <RenameInput
            onSubmit={handleRename}
            onCancel={() => setIsRenaming(false)}
            type="folder"
            level={level}
            defaultValue={item.fileName}
            isOpen={isOpen}
          />
          {isOpen && folderContents.isLoading && (
            <LoadingRow level={level + 1} />
          )}
          {isOpen &&
            !folderContents.isLoading &&
            folderContents.data?.map((child) => (
              <Tree
                key={child._id}
                item={child}
                level={level + 1}
                projectId={projectId}
              />
            ))}
        </>
      );
    }
    return (
      <>
        <TreeItemWrapper
          item={item}
          level={level}
          onClick={() => setIsOpen((val) => !val)}
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
          {FolderContent}
        </TreeItemWrapper>
        {isOpen && folderContents.isLoading && <LoadingRow level={level + 1} />}
        {isOpen &&
          !folderContents.isLoading &&
          folderContents.data?.map((child) => (
            <Tree
              key={child._id}
              item={child}
              level={level + 1}
              projectId={projectId}
            />
          ))}
      </>
    );
  }

  if (item.fileType === "file") {
    if (isRenaming) {
      return (
        <RenameInput
          onSubmit={handleRename}
          onCancel={() => setIsRenaming(false)}
          type="file"
          level={level}
          defaultValue={item.fileName}
          isOpen={isOpen}
        />
      );
    }
    const fileName = item.fileName;
    const isActive = activeTabId === item._id;
    return (
      <TreeItemWrapper
        item={item}
        level={level}
        onClick={() => openFile(item._id, { pinned: false })}
        onDoubleClick={() => openFile(item._id, { pinned: true })}
        onDelete={() => {
          closeTab(item._id);
          deleteFile.mutate({
            fileId: item._id,
          });
        }}
        onRename={() => setIsRenaming(true)}
        projectId={projectId}
        isActive={isActive}
        // onCreateFile={() => setCreating("file")}
        // onCreateFolder={() => setCreating("folder")}
      >
        <FileIcon className="size-4" fileName={fileName} />
        <span className="truncate">{fileName}</span>
      </TreeItemWrapper>
    );
  }
}
