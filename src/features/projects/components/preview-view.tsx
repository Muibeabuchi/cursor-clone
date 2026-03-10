import { Allotment } from "allotment";
import {
  AlertTriangleIcon,
  Loader2Icon,
  RefreshCwIcon,
  TerminalSquareIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import PreviewSettingsPopover from "~/features/preview/components/preview-settings-popover";
import { PreviewTerminal } from "~/features/preview/components/terminal-preview";
import { useWebContainer } from "~/features/preview/hooks/use-webContainer";
import { useGetProjectById } from "../hooks/use-projects";
import { Id } from "convex/_generated/dataModel";
import { ClientOnly } from "@tanstack/react-router";

export const PreviewView = ({ projectId }: { projectId: Id<"projects"> }) => {
  const { data: project } = useGetProjectById(projectId);
  const [showTerminal, setShowTerminal] = useState(true);
  const { error, previewUrl, restart, status, terminalOutput } =
    useWebContainer({
      enabled: true,
      projectId,
      settings: project.settings,
    });
  //   console.log({ terminalOutput });
  const isLoading = status === "booting" || status === "installing";

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="h-8.75 flex items-center border-b bg-sidebar shrink-0">
        <Button
          size="sm"
          variant="ghost"
          className="h-full rounded-none"
          disabled={isLoading}
          onClick={restart}
          title="Restart container"
        >
          <RefreshCwIcon className="size-3" />
        </Button>

        <div className="flex-1 h-full flex items-center px-3 bg-background border-x text-xs text-muted-foreground truncate font-mono">
          {isLoading && (
            <div className="flex items-center gap-1.5">
              <Loader2Icon className="size-3 animate-spin" />
              {status === "booting" ? "Starting..." : "Installing..."}
            </div>
          )}
          {previewUrl && <span className="truncate">{previewUrl}</span>}{" "}
          {previewUrl && !isLoading && !error && (
            <span className="ml-1"> Ready to preview</span>
          )}
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="h-full rounded-none"
          disabled={isLoading}
          onClick={() => setShowTerminal((value) => !value)}
          title="Toggle Terminal"
        >
          <TerminalSquareIcon className="size-3" />
        </Button>
        <PreviewSettingsPopover
          projectId={projectId}
          onSave={restart}
          initialSettings={project?.settings}
        />
      </div>

      <div className="flex-1 min-h-0">
        <ClientOnly>
          <Allotment vertical>
            <Allotment.Pane>
              {error && (
                <div className="size-full flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2 max-w-md mx-auto text-center ">
                    <AlertTriangleIcon className="size-6" />
                    <p className="font-medium text-sm">{error}</p>
                    <Button size="sm" variant="outline" onClick={restart}>
                      <RefreshCwIcon className="size-4">Restart</RefreshCwIcon>
                    </Button>
                  </div>
                </div>
              )}
              {isLoading && !error && (
                <div className="size-full flex items-center justify-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2 max-w-md mx-auto text-center ">
                    <Loader2Icon className="size-6 animate-spin" />
                    <p className="font-medium text-sm">Installing...</p>
                  </div>
                </div>
              )}

              {previewUrl && !error && (
                <iframe
                  src={previewUrl}
                  className="size-full border-0"
                  title="Preview"
                />
              )}
            </Allotment.Pane>
            {showTerminal && (
              <Allotment.Pane minSize={100} maxSize={500} preferredSize={200}>
                <div className="h-full flex flex-col bg-background border-t">
                  <div className="h-7 flex items-center px-3 text-xs gap-1.5 text-muted-foreground border-b border-border/50 shrink-0">
                    <TerminalSquareIcon className="size-3" />
                    Terminal
                  </div>
                  {/* <ClientOnly> */}
                  <PreviewTerminal output={terminalOutput} />
                  {/* </ClientOnly> */}
                </div>
              </Allotment.Pane>
            )}
          </Allotment>
        </ClientOnly>
      </div>
    </div>
  );
};
