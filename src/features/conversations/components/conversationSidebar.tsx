import { Id } from "convex/_generated/dataModel";
import { toast } from "sonner";
import { CopyIcon, HistoryIcon, LoaderIcon, PlusIcon } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "~/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageAction,
  MessageActions,
  MessageResponse,
} from "~/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "~/components/ai-elements/prompt-input";
import ky from "ky";
import { useState } from "react";
import { Button } from "~/components/ui/button";

import {
  useConversations,
  useConversation,
  useCreateConversation,
  useMessages,
  // useSendMessage,
} from "../hooks/use-conversations";

export const DEFAULT_CONVERSATION = "New Conversation";

export const ConversationSidebar = ({
  projectId,
}: {
  projectId: Id<"projects">;
}) => {
  const [input, setInput] = useState("");
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const { data: conversations } = useConversations({ projectId });
  const createConversation = useCreateConversation();
  const activeConversation =
    selectedConversationId ?? conversations?.[0]?._id ?? null;

  const { data: messages } = useMessages({
    conversationId: activeConversation,
  });
  const { data: conversation } = useConversation({
    conversationId: activeConversation,
  });
  // const sendMessage = useSendMessage();

  const isProcessing = messages?.some((m) => m.status === "processing");

  const handleCreateConversation = async () => {
    try {
      const conversationId = await createConversation.mutateAsync({
        projectId,
        title: DEFAULT_CONVERSATION,
      });
      setSelectedConversationId(conversationId);
      return conversationId;
    } catch (error) {
      toast.error("Failed to create conversation");
      return null;
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    if (isProcessing || !message.text.trim()) {
      // TODO: await handleCancle()
      setInput("");
      return;
    }

    let conversationId = activeConversation;
    if (!conversationId) {
      conversationId = await handleCreateConversation();
      if (!conversationId) return;
    }

    // TRIGGER INGEST FUNCTION VIA API
    try {
      await ky.post("/api/messages", {
        json: {
          projectId,
          conversationId,
          content: message.text,
        },
      });
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="h-8.75 flex items-center justify-between border-b">
        <div className="text-sm truncate pl-3">
          {conversation?.title ?? DEFAULT_CONVERSATION}
        </div>
        <div className="flex items-center px-1 gap-1">
          <Button variant="highlight" size="icon-xs" className="">
            <HistoryIcon className="size-3.5" />
          </Button>
          <Button
            variant="highlight"
            size="icon-xs"
            className=""
            onClick={handleCreateConversation}
          >
            <PlusIcon className="size-3" />
          </Button>
        </div>
      </div>
      <Conversation className="flex-1">
        <ConversationContent>
          {messages?.map((message, messageIndex) => (
            <Message
              key={message._id}
              from={message.role === "user" ? "user" : "assistant"}
            >
              <MessageContent>
                {message.status === "processing" ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LoaderIcon className="size-3.5 animate-spin" />
                    <span>{message.content || "Thinking..."}</span>
                  </div>
                ) : (
                  <MessageResponse>{message.content}</MessageResponse>
                )}
              </MessageContent>
              {message.role === "assistant" &&
                message.status === "completed" &&
                messageIndex === (messages.length ?? 0) - 1 && (
                  <MessageActions>
                    <MessageAction
                      onClick={() => {
                        navigator.clipboard.writeText(message.content);
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
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="p-3">
        <PromptInput onSubmit={handleSubmit} className="mt-2">
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Koda anything..."
              disabled={!isProcessing}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools />
            <PromptInputSubmit
              disabled={isProcessing ? false : !input}
              status={isProcessing ? "streaming" : undefined}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};
