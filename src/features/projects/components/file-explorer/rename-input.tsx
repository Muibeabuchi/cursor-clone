import { ChevronRightIcon } from "lucide-react";
import { FileIcon, FolderIcon } from "@react-symbols/icons/utils";
import { FileType } from "convex/schema";
import { useState } from "react";
import { getPadding } from "./constants";
import { cn } from "~/lib/utils";

interface CreateInputProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
  type: FileType;
  level: number;
  defaultValue: string;
  isOpen?: boolean;
}

const RenameInput = ({
  level,
  onCancel,
  onSubmit,
  type,
  defaultValue,
  isOpen,
}: CreateInputProps) => {
  const [value, setValue] = useState(defaultValue);
  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      onSubmit(value);
    } else {
      onCancel();
    }
  };
  return (
    <div
      className="flex items-center gap-1 h-5.5 bg-accent/30 w-full "
      style={{ paddingLeft: getPadding({ level, isFile: type === "file" }) }}
    >
      <div className="flex items-center gap-0.5">
        {type === "folder" && (
          <ChevronRightIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground",
              isOpen && "rotate-90",
            )}
          />
        )}
        {type === "file" && (
          <FileIcon fileName={value} className="size-4 " autoAssign />
        )}
        {type === "folder" && (
          <FolderIcon folderName={value} className="size-4 " />
        )}
      </div>

      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSubmit}
        className="flex-1 bg-transparent text-sm outline-none focus:ring-1 focus:ring-inset focus:ring-ring"
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSubmit();
          if (e.key === "Escape") onCancel();
        }}
        onFocus={(e) => {
          if (type === "folder") {
            e.currentTarget.select();
          } else {
            const value = e.currentTarget.value;
            const lastDotIndex = value.lastIndexOf(".");
            if (lastDotIndex !== -1) {
              e.currentTarget.setSelectionRange(0, lastDotIndex);
            } else {
              e.currentTarget.select();
            }
          }
        }}
      />
      {/* <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" /> */}
      {/* <p className="text-xs uppercase line-clamp-1">{project.name}</p> */}
    </div>
  );
};

export default RenameInput;
