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
// import ky from "ky";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  useConversations,
  useConversation,
  useCreateConversation,
  // useMessages,
  // useSendMessage,
} from "../hooks/use-conversations";
import { PastConversationsDialog } from "./past-conversations-dialog";
import { useUIMessages } from "@convex-dev/agent/react";
import { api } from "convex/_generated/api";
import { useSendMessage } from "~/features/messages/hooks/useMessages";
import SmoothMessage from "~/features/messages/components/smoothMessage";
import { useMutation } from "convex/react";

export const DEFAULT_CONVERSATION = "New Conversation";

export const ConversationSidebar = ({
  projectId,
}: {
  projectId: Id<"projects">;
}) => {
  const [input, setInput] = useState("");
  const [pastConversationCommandOpen, setPastConversationCommandOpen] =
    useState(false);
  console.log("pastConversationCommandOpen", pastConversationCommandOpen);
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"projectThreads"> | null>(null);
  const { data: conversations } = useConversations({
    projectId,
    paginationOpts: {
      cursor: null,
      numItems: 20,
    },
  });
  const abortStreamById = useMutation(
    api.controller.messages.cancelProcessMessageAgentWorkflow,
  );
  const createConversation = useCreateConversation();
  const activeConversationId =
    selectedConversationId ??
    (conversations?.page?.[0]?.filteredProjecthread
      ?._id as Id<"projectThreads"> | null) ??
    null;

  console.log("activeConversationId", activeConversationId);
  const { data: conversation } = useConversation({
    projectThreadId: activeConversationId,
  });

  const {
    results: messages,
    status,
    loadMore,
  } = useUIMessages(
    api.controller.messages.getMessagesByProjectThreadId,
    conversation && activeConversationId
      ? {
          threadId: conversation.thread._id,
          projectThreadId: activeConversationId,
        }
      : "skip",
    {
      initialNumItems: 20,
      stream: true,
    },
  );

  const sendMessage = useSendMessage();

  // check if any of the messages in this thread is still processing
  const isProcessing = messages?.some((m) => m.status === "streaming");

  const handleCreateConversation = async () => {
    try {
      const { projectThreadId } = await createConversation.mutateAsync({
        projectId,
        title: DEFAULT_CONVERSATION,
      });
      setSelectedConversationId(projectThreadId);
      toast.success("Conversation created");
      return projectThreadId;
    } catch (error) {
      toast.error("Failed to create conversation");
      return null;
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    // console.log("handle submit has been called");
    if (!conversation) return;
    if (!activeConversationId) {
      toast.warning("create a conversation");
      return;
    }
    // if (!activeConversationId) return;
    if (activeConversationId && (isProcessing || !message.text.trim())) {
      // TODO: await handleCancel()
      abortStreamById({
        threadId: conversation.thread._id,
        projectThreadId: activeConversationId,
      });
      setInput("");
      return;
    }
    console.log("handle submit has been called");

    let conversationId: Id<"projectThreads"> | null = activeConversationId;
    if (!conversationId) {
      conversationId = await handleCreateConversation();
      if (!conversationId) return;
    }
    // call convex function that continues a thread
    await sendMessage.mutateAsync({
      threadId: conversation.projectThread.threadId,
      projectThreadId: conversationId,
      prompt: message.text,
    });

    setInput("");
  };

  return (
    <>
      <div className="flex flex-col h-full bg-sidebar">
        <div className="h-8.75 flex items-center justify-between border-b">
          {conversation ? (
            <div className="text-sm truncate pl-3">
              {conversation.thread.title ?? DEFAULT_CONVERSATION}
            </div>
          ) : (
            <div className="text-sm truncate pl-3">No Conversation</div>
          )}
          <div className="flex items-center px-1 gap-1">
            <Button
              variant="highlight"
              size="icon-xs"
              className=""
              onClick={() => setPastConversationCommandOpen(true)}
            >
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
        {conversation ? (
          <Conversation className="flex-1">
            {/* conversationContent */}
            <ConversationContent>
              {messages?.map((message, messageIndex) => {
                return (
                  <SmoothMessage
                    message={message}
                    messageIndex={messageIndex}
                    messages={messages}
                  />
                );
              })}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
        ) : (
          <div className="flex-1">
            <div className="flex items-center justify-center h-full">
              <div className="text-sm text-muted-foreground">
                No conversation selected
              </div>
            </div>
          </div>
        )}
        <div className="p-3">
          <PromptInput onSubmit={handleSubmit} className="mt-2">
            <PromptInputBody>
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Koda anything..."
                disabled={isProcessing || !conversation}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit
                disabled={isProcessing ? false : !input || !conversation}
                status={isProcessing ? "streaming" : undefined}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
      <PastConversationsDialog
        projectId={projectId}
        onSelect={(conversationId) => {
          setSelectedConversationId(conversationId);
          setPastConversationCommandOpen(false);
        }}
        open={pastConversationCommandOpen}
        onOpenChange={setPastConversationCommandOpen}
      />
    </>
  );
};

//
