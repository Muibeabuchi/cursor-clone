import { Id } from "convex/_generated/dataModel";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useGetProject, useRenameProjectName } from "../hooks/use-projects";
import { useState } from "react";
import { Input } from "~/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { CloudCheckIcon, LoaderIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
// import { Logo } from "~/components/logo";

interface NavbarProps {
  projectId: Id<"projects">;
}

const Navbar = ({ projectId }: NavbarProps) => {
  const { data: project } = useGetProject(projectId);
  const { mutateAsync: renameProjectName } = useRenameProjectName();
  const [name, setName] = useState(project?.name || "New Project");
  const [isRenaming, setIsRenaming] = useState(false);

  const handleRenameProjectName = async () => {
    if (!project) return;
    setIsRenaming(false);
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === project.name) return;
    await renameProjectName({ projectId, name: trimmedName });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRenameProjectName();
    } else if (e.key === "Escape") {
      setIsRenaming(false);
    }
  };

  return (
    <nav className="flex bg-sidebar justify-between items-center border border-b p-2 gap-x-2">
      <div className="flex items-center gap-x-2">
        <Breadcrumb>
          <BreadcrumbList className="gap-0!">
            <BreadcrumbItem>
              <BreadcrumbLink className="flex items-center gap-1.5 " asChild>
                <Button className="w-fit! p-1.5! h-7!" variant="ghost" asChild>
                  <Link to="/">
                    <img
                      src="/logo.svg"
                      alt="logo"
                      className=""
                      height={20}
                      width={20}
                    />
                    <span className={cn("text-sm font-medium font-poppins")}>
                      Koda
                    </span>
                  </Link>
                </Button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="ml-0! mr-1!" />
            {/* <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Projects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem> */}
            {/* <BreadcrumbSeparator /> */}
            <BreadcrumbItem>
              {isRenaming ? (
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={handleRenameProjectName}
                  onFocus={(e) => e.currentTarget.select()}
                  onKeyDown={handleKeyDown}
                  className="text-sm bg-transparent text-foreground outline-none focus:ring-1 focus:ring-inset focus:ring-ring font-medium max-w-40 truncate"
                />
              ) : (
                <BreadcrumbPage
                  onClick={() => setIsRenaming(true)}
                  className="text-sm cursor-pointer hover:text-primary font-medium max-w-40 truncate"
                >
                  {project?.name || "New Project"}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {project.importStatus === "importing" ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <LoaderIcon className="size-4 text-muted-foreground animate-spin" />
            </TooltipTrigger>
            <TooltipContent>Importing...</TooltipContent>
          </Tooltip>
        ) : project.updatedAt ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <CloudCheckIcon className="size-4 text-muted-foreground " />
            </TooltipTrigger>
            <TooltipContent>
              Saved {formatDistanceToNow(project.updatedAt)}{" "}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </nav>
  );
};

export default Navbar;
