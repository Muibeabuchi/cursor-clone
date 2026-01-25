import { FaGithub } from "react-icons/fa";
import { Loader2Icon } from "lucide-react";
import { AlertCircleIcon } from "lucide-react";
import { GlobeIcon } from "lucide-react";
import { Doc } from "convex/_generated/dataModel";

export function getProjectIcon({ project }: { project: Doc<"projects"> }) {
  if (project.importStatus === "completed")
    return <FaGithub className="size-3.5 text-muted-foreground" />;
  if (project.importStatus === "importing")
    return (
      <Loader2Icon className="size-3.5 text-muted-foreground animate-spin" />
    );
  if (project.importStatus === "failed")
    return <AlertCircleIcon className="size-3.5 text-muted-foreground" />;

  return <GlobeIcon className="size-3.5 text-muted-foreground" />;
}
