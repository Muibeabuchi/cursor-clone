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
}

const CreateInput = ({ level, onCancel, onSubmit, type }: CreateInputProps) => {
  const [value, setValue] = useState("");
  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      onSubmit(trimmedValue);
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
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
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
      />
      {/* <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" /> */}
      {/* <p className="text-xs uppercase line-clamp-1">{project.name}</p> */}
    </div>
  );
};

export default CreateInput;
