import { useRouter } from "@tanstack/react-router";
import { AlertCircleIcon, GlobeIcon, LoaderIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import { useProjects } from "../hooks/use-projects";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Id } from "convex/_generated/dataModel";
import { getProjectIcon } from "~/utils/project";

interface ProjectsCommndDiaogueProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const projectsCommndDiaogue = ({
  open,
  onOpenChange,
}: ProjectsCommndDiaogueProps) => {
  const router = useRouter();
  const { data: projects } = useProjects();

  const handleProjectSelection = (projectId: Id<"projects">) => {
    router.navigate({
      to: `/projects/$projectId`,
      params: {
        projectId,
      },
    });
    onOpenChange(false);
  };

  return (
    // <div>
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Projects"
      description="Search and navigate to your projects "
    >
      <CommandInput placeholder="Search projects..." />
      <CommandList>
        <CommandEmpty>No Project Found.</CommandEmpty>
        <CommandGroup heading="Projects">
          {projects?.map((project) => (
            <CommandItem
              key={project._id}
              onSelect={() => {
                handleProjectSelection(project._id);
              }}
              value={`${project.name} - ${project._id}`}
            >
              {getProjectIcon({ project })}
              <span>{project.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
    // </div>
  );
};

export default projectsCommndDiaogue;
