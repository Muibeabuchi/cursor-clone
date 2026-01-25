import { SparkleIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import { Kbd } from "~/components/ui/kbd";
import { cn } from "~/lib/utils";
import ProjectList from "./project-list";
import ProjectsCommndDiaogue from "./projects-command-diaogue";
import { useState } from "react";

export const ProjectsView = () => {
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);

  return (
    <>
      {/* {commandDialogOpen && ( */}
      <ProjectsCommndDiaogue
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />
      {/* )} */}
      <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-6 md:p-16">
        <div className="max-w-sm mx-auto flex-col w-full flex gap-4 items-center">
          <div className="flex justify-between w-full items-center gap-4">
            <div className="flex items-center gap-2 w-full group/logo">
              <img
                src="koda-logo.png"
                alt="Logo"
                className="size-[32px] md:size-[46px] rounded-full"
              />
              <h1
                className={cn("text-4xl md:text-5xl font-semibold text-white")}
              >
                Koda
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-full w-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
              >
                <div className="flex items-center justify-between w-full">
                  <SparkleIcon className="size-4" />
                  <Kbd className="bg-accent border">CTRL + J</Kbd>
                </div>
                <div className="">
                  <span className="text-sm">New</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-full items-start justify-start p-4 bg-background border flex flex-col gap-6 rounded-none"
              >
                <div className="flex items-center justify-between w-full">
                  <FaGithub className="size-4 " />
                  <Kbd className="bg-accent border">CTRL + I</Kbd>
                </div>
                <div className="">
                  <span className="text-sm">Import</span>
                </div>
              </Button>
            </div>

            <ProjectList onViewAll={() => setCommandDialogOpen(true)} />
          </div>
        </div>
      </div>
    </>
  );
};
