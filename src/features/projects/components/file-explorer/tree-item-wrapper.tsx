import { cn } from "~/lib/utils";

import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuContent,
  ContextMenuTrigger,
  ContextMenuShortcut,
  ContextMenuSeparator,
} from "~/components/ui/context-menu";
import { getPadding } from "./constants";
import { Doc } from "convex/_generated/dataModel";
import { PropsWithChildren } from "react";

interface TreeItemWrapperProps {
  item: Doc<"files">;
  level: number;
  projectId: string;
  //   children: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onRename: () => void;
  onDelete: () => void;
  onCreateFile?: () => void;
  onCreateFolder?: () => void;
}

export function TreeItemWrapper({
  item,
  level = 0,
  projectId,
  isActive = false,
  onClick,
  onDoubleClick,
  onRename,
  onDelete,
  onCreateFile,
  onCreateFolder,
  children,
}: PropsWithChildren<TreeItemWrapperProps>) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onRename?.();
            }
          }}
          className={cn(
            "group flex items-center gap-1 w-full h-5.5 hover:bg-accent/30 outline-none focus:ring-1 focus:ring-ring focus:ring-inset",
            isActive && "bg-accent/30",
          )}
          style={{
            paddingLeft: getPadding({
              level,
              isFile: item.fileType === "file",
            }),
          }}
        >
          {children}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-64"
      >
        {item.fileType === "folder" && (
          <>
            <ContextMenuItem onClick={onCreateFile} className="text-sm">
              New File...
            </ContextMenuItem>
            <ContextMenuItem onClick={onCreateFolder} className="text-sm">
              New Folder...
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        <ContextMenuItem onClick={onRename}>
          Rename...
          <ContextMenuShortcut>Enter</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onDelete}>
          Delete Permanently
          <ContextMenuShortcut> CTRL + Backspace</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onCreateFile}>
          Create File
          <ContextMenuShortcut>Ctrl+N</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem onClick={onCreateFolder}>
          Create Folder
          <ContextMenuShortcut>Ctrl+Shift+N</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
