import { UIMessage, useSmoothText } from "@convex-dev/agent/react";
import {
  Message,
  MessageContent,
  MessageAction,
  MessageActions,
  MessageResponse,
} from "~/components/ai-elements/message";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";
import { CopyIcon } from "lucide-react";

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
    // This tells the hook that it's ok to start streaming immediately.
    // If this was always passed as true, messages that are already done would
    // also stream in.
    // IF this was always passed as false (default), then the streaming message
    // wouldn't start streaming until the second chunk was received.
    startStreaming: message.status === "streaming",
  });

  return (
    <Message
      key={message.id}
      from={message.role === "user" ? "user" : "assistant"}
    >
      <MessageContent>
        {message.status === "streaming" ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <LoaderIcon className="size-3.5 animate-spin" />
            <span>{visibleText || "Thinking..."}</span>
          </div>
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
              <CopyIcon className="size-3.3" />
            </MessageAction>
            {/* <MessageAction>
                       <RegenerateIcon className="size-3.5" />
                       Regenerate
                     </MessageAction> */}
          </MessageActions>
        )}
    </Message>
  );
};

export default SmoothMessage;
