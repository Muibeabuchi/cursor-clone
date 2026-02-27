import { Spinner } from "~/components/ui/spinner";
import { useProjectsPartial } from "../hooks/use-projects";

import { Kbd } from "~/components/ui/kbd";
import { Doc } from "convex/_generated/dataModel";
import { Link } from "@tanstack/react-router";
import {
  AlertCircleIcon,
  ArrowRightIcon,
  GlobeIcon,
  Loader2Icon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FaGithub } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import { getProjectIcon } from "~/utils/project";

interface ProjectListProps {
  onViewAll: () => void;
}

function formatTimeStamp(timestamp: number) {
  return formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
  });
}

const ContinueCard = ({ data }: { data: Doc<"projects"> }) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-muted-foreground">Last Updated</span>
      <Button
        asChild
        variant="outline"
        className="h-auto items-start justify-start p-4 bg-background border rounded-none flex flex-col gap-2"
      >
        <Link
          className="group"
          to={`/projects/$projectId`}
          params={{ projectId: data._id }}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {getProjectIcon({ project: data })}
              <span className="truncate font-medium">{data.name}</span>
            </div>
            <ArrowRightIcon className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="text-xs text-muted-foreground ">
            {formatTimeStamp(data.updatedAt)}
          </span>
        </Link>
      </Button>
    </div>
  );
};

const ProjectItem = ({ data }: { data: Doc<"projects"> }) => {
  return (
    <Link
      to={`/projects/$projectId`}
      params={{ projectId: data._id }}
      className="flex items-center justify-between w-full group text-sm text-foreground/60 hover:text-foreground py-1 "
    >
      <div className="flex items-center gap-2">
        {getProjectIcon({ project: data })}
        <span className="truncate ">{data.name}</span>
      </div>
      <span className="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors ">
        {formatTimeStamp(data.updatedAt)}
      </span>
    </Link>
  );
};

const ProjectList = ({ onViewAll }: ProjectListProps) => {
  const { data: projects, isPending } = useProjectsPartial(6);
  // const { mutate: createProject } = useCreateProjects();

  if (isPending) {
    return <Spinner className="size-4 text-ring" />;
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-none bg-background text-center">
        <div className="flex bg-muted/50 p-3 rounded-full mb-4">
          <AlertCircleIcon className="size-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium text-foreground">No projects yet</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Create a new project or import an existing repository to get started.
        </p>
      </div>
    );
  }

  const [mostRecent, ...rest] = projects;

  return (
    <div className="flex flex-col gap-4 ">
      {mostRecent ? <ContinueCard data={mostRecent} /> : null}
      {rest.length > 0 ? (
        <div className="flex flex-col gap-2 ">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              Recent Projects
            </span>
            <button
              onClick={onViewAll}
              className="flex items-center gap-2 text-muted-foreground text-xs hover:text-foreground transition-colors"
            >
              <span>View All</span>
              <Kbd className="bg-accent border"> CTRL + K</Kbd>
            </button>
          </div>

          <ul className="flex flex-col">
            {rest.map((project) => (
              <ProjectItem key={project._id} data={project} />
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default ProjectList;
