import { UIMessage, useSmoothText } from "@convex-dev/agent/react";
import {
  Message,
  MessageContent,
  MessageAction,
  MessageActions,
  MessageResponse,
} from "~/components/ai-elements/message";
import {
  LoaderIcon,
  BrainIcon,
  WrenchIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayCircleIcon,
  AlertOctagon,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { CopyIcon } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { Button } from "~/components/ui/button";
import { ToolUIPart, UIToolInvocation, UITool } from "ai";
import { toolCallNames } from "convex/utils/constants";

const ToolCallUI = ({
  toolCall,
}: {
  toolCall: {
    type: `tool-${string}`;
  } & UIToolInvocation<UITool>;
}) => {
  // const toolName = toolCallNames;
  const toolName = toolCall.type.replace("tool-", "");
  const state = toolCall.state;

  // UIMessagePart<UIDataTypes, UITools>;

  switch (state) {
    case "input-streaming":
    case "input-available":
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/50 w-fit px-2.5 py-1.5 rounded-md border border-border/50">
          <LoaderIcon className="size-3 animate-spin text-blue-500" />
          <span className="font-mono">{toolName}</span>
          <span className="text-muted-foreground/70 animate-pulse">
            running...
          </span>
        </div>
      );
    case "output-available":
    case "approval-responded":
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 w-fit px-2.5 py-1.5 rounded-md border border-border/50 transition-colors hover:bg-muted">
          <CheckCircleIcon className="size-3 text-green-500" />
          <span className="font-mono">{toolName}</span>
        </div>
      );
    case "output-error":
      return (
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 w-fit px-2.5 py-1.5 rounded-md border border-destructive/20">
          <XCircleIcon className="size-3" />
          <span className="font-mono">{toolName}</span>
          <span className="opacity-80">Failed</span>
        </div>
      );
    case "approval-requested":
      return (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/10 w-fit px-2.5 py-1.5 rounded-md border border-amber-500/20">
          <PlayCircleIcon className="size-3" />
          <span className="font-mono">{toolName}</span>
          <span className="opacity-80">Needs Approval</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 w-fit px-2.5 py-1.5 rounded-md border border-border/50">
          <WrenchIcon className="size-3" />
          <span className="font-mono">{toolName}</span>
          <span className="opacity-80">({state})</span>
        </div>
      );
  }
};

const SmoothMessage = ({
  message,
  messageIndex,
  messages,
}: {
  message: UIMessage;
  messageIndex: number;
  messages: UIMessage[];
}) => {
  const [visibleText] = useSmoothText(message.text, {
    startStreaming: message.status === "streaming",
  });

  const [reasoningText] = useSmoothText(
    message.parts
      .filter((p) => p.type === "reasoning")
      .map((p) => p.text)
      .join("\n") ?? "",
    {
      startStreaming: message.status === "streaming",
    },
  );

  // const toolName = toolCall.type.replace("tool-", "");
  const toolCalls = message.parts.filter((p): p is ToolUIPart =>
    p.type.startsWith("tool-"),
  );

  const [isReasoningOpen, setIsReasoningOpen] = useState(false);

  return (
    <Message
      key={message.id}
      from={message.role === "user" ? "user" : "assistant"}
    >
      <MessageContent>
        {toolCalls.length > 0 && (
          <div className="flex flex-col gap-1.5 w-full">
            {toolCalls.map((toolCall, idx) => (
              <ToolCallUI key={idx} toolCall={toolCall} />
            ))}
          </div>
        )}

        {reasoningText && (
          <Collapsible
            open={isReasoningOpen}
            onOpenChange={setIsReasoningOpen}
            className=" w-full h-full   rounded-md border border-border/50 bg-muted/30 "
          >
            <CollapsibleTrigger className="p-0" asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="w-full h-full p-2 hover:bg-transparent text-muted-foreground hover:text-foreground flex items-center justify-between space-x-4 "
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <BrainIcon className="size-3.5" />
                  <span>Thought Process</span>
                </div>
                {isReasoningOpen ? (
                  <ChevronUpIcon className="size-3.5" />
                ) : (
                  <ChevronDownIcon className="size-3.5" />
                )}
                <span className="sr-only">Toggle reasoning</span>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="px-2 pb-1">
              <div className="text-xs text-muted-foreground/80 whitespace-pre-wrap font-mono leading-relaxed">
                {reasoningText}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {message.status === "streaming" ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <LoaderIcon className="size-3.5 animate-spin" />
            <span>Thinking...</span>
          </div>
        ) : message.status === "failed" ? (
          <>
            {/* {message?.error} */}
            <AlertOctagon />
            <MessageResponse>Error </MessageResponse>
          </>
        ) : message.status === "pending" && message.text === "" ? (
          <>
            {/* appropriate icon for failed generation */}
            <AlertCircle />
            <MessageResponse>Error Generating response</MessageResponse>
          </>
        ) : (
          <MessageResponse>{visibleText}</MessageResponse>
        )}
      </MessageContent>
      {message.role === "assistant" &&
        message.status === "success" &&
        messageIndex === (messages.length ?? 0) - 1 && (
          <MessageActions>
            <MessageAction
              onClick={() => {
                navigator.clipboard.writeText(message.text);
                toast.success("Copied to clipboard");
              }}
              label="Copy"
            >
              <CopyIcon className="size-3" />
            </MessageAction>
          </MessageActions>
        )}
    </Message>
  );
};

export default SmoothMessage;
