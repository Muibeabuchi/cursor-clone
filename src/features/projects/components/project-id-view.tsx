import { Id } from "convex/_generated/dataModel";
import { useGetProjectById } from "../hooks/use-projects";
import { cn } from "~/lib/utils";
import { activeViewType } from "~/routes/(main)/_main-layout/projects.$projectId.index";
import { useNavigate } from "@tanstack/react-router";
import { FaGithub } from "react-icons/fa";

const Tab = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center h-full gap-2 px-3 cursor-pointer text-muted-foreground border-r hover:bg-accent/30",
        isActive && "bg-background text-foreground",
      )}
    >
      <span className="text-sm">{label}</span>
    </div>
  );
};

const ProjectIdView = ({
  projectId,
  activeView,
}: {
  projectId: Id<"projects">;
  activeView: activeViewType;
}) => {
  const { data: project } = useGetProjectById(projectId);
  const navigate = useNavigate({ from: "/projects/$projectId/" });
  const setActiveView = (activeView: activeViewType) => {
    navigate({
      search: { activeView },
    });
  };
  return (
    <div className="flex  h-full flex-col">
      <nav className="h-[35px] flex items-center border-b  bg-sidebar">
        <Tab
          label="Code"
          isActive={activeView === "code"}
          onClick={() => setActiveView("code")}
        />
        <Tab
          label="Preview"
          isActive={activeView === "preview"}
          onClick={() => setActiveView("preview")}
        />

        <div className="flex-1 flex justify-end h-full">
          <div className="flex items-center h-full gap-1.5 px-3 cursor-pointer text-muted-foreground border-l hover:bg-accent/30">
            {/* <Button */}
            <FaGithub className="size-3.5" />
            <span className="text-sm">Export</span>
          </div>
        </div>
      </nav>
      <div className="flex-1 relative">
        <div
          className={cn(
            "absolute inset-0",
            activeView === "code" ? "" : "hidden",
          )}
        ></div>
        <div
          className={cn(
            "absolute inset-0",
            activeView === "code" ? "visible" : "invisible",
          )}
        >
          <div className="">Editor</div>
        </div>

        <div
          className={cn(
            "absolute inset-0",
            activeView === "preview" ? "visible" : "invisible",
          )}
        >
          <div className="">Preview</div>
        </div>
      </div>
    </div>
  );
};

export default ProjectIdView;
