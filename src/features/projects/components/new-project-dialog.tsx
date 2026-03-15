import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
} from "~/components/ui/dialog";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "~/components/ai-elements/prompt-input";
import { Doc, Id } from "convex/_generated/dataModel";
import { useCreateProjects } from "../hooks/use-projects";

export default function NewProjectDialog({
  onOpenChange,
  open,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsubmitting] = useState(false);

  const navigate = useNavigate();
  const { mutateAsync: createProjectWithMessage, isPending } =
    useCreateProjects();

  const handleSubmit = async (message: PromptInputMessage) => {
    if (!message.text) return;
    setIsubmitting(true);
    try {
      const { projectId } = await createProjectWithMessage({
        prompt: message.text.trim(),
      });
      toast.success("Projected created successfully");
      onOpenChange(false);
      setInput("");
      navigate({
        to: "/projects/$projectId",
        params: {
          projectId,
        },
        search: (old) => ({
          ...old,
          activeView: old.activeView ?? "code",
          // activeView: "editor",
        }),
      });
    } catch {
      toast.error("Unable to create Project");
    } finally {
      setIsubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="p-0 sm:max-w-lg">
        <DialogHeader className="sr-only">
          <DialogTitle>What do you want to build</DialogTitle>
          <DialogDescription>
            Describe your projects and AI will help you build it
          </DialogDescription>
        </DialogHeader>

        <PromptInput onSubmit={handleSubmit} className="border-none!">
          <PromptInputBody>
            <PromptInputTextarea
              placeholder="Ask polaris to build..."
              onChange={(e) => setInput(e.target.value)}
              value={input}
              disabled={isPending || isSubmitting}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit disabled={isPending || isSubmitting} />
          </PromptInputFooter>
        </PromptInput>
      </DialogContent>
    </Dialog>
  );
}
