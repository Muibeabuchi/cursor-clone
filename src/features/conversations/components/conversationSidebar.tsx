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
  const createConversation = useCreateConversation();
  const activeConversation =
    selectedConversationId ??
    (conversations?.page?.[0]?.filteredProjecthread
      ?._id as Id<"projectThreads"> | null) ??
    null;

  console.log("activeConversation", activeConversation);
  const { data: conversation } = useConversation({
    projectThreadId: activeConversation,
  });

  // check if any of the messages in this thread is still processing
  // const isProcessing = messages?.some((m) => m.status === "processing");

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
    // if (isProcessing || !message.text.trim()) {
    //   // TODO: await handleCancel()
    //   setInput("");
    //   return;
    // }

    let conversationId: Id<"projectThreads"> | null | undefined =
      activeConversation;
    if (!conversationId) {
      conversationId = await handleCreateConversation();
      if (!conversationId) return;
    }
    // call convex function that continues a thread

    setInput("");
  };

  return (
    <>
      <div className="flex flex-col h-full bg-sidebar">
        <div className="h-8.75 flex items-center justify-between border-b">
          <div className="text-sm truncate pl-3">
            {conversation?.thread.title ?? DEFAULT_CONVERSATION}
          </div>
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
        <Conversation className="flex-1">
          {/* conversationContent */}
          <ConversationScrollButton />
        </Conversation>
        <div className="p-3">
          <PromptInput onSubmit={handleSubmit} className="mt-2">
            <PromptInputBody>
              <PromptInputTextarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Koda anything..."
                // disabled={isProcessing}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit
              // disabled={isProcessing ? false : !input}
              // status={isProcessing ? "streaming" : undefined}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
      <PastConversationsDialog
        projectId={projectId}
        open={pastConversationCommandOpen}
        onOpenChange={setPastConversationCommandOpen}
      />
    </>
  );
};

// <ConversationContent>
//           {messages?.map((message, messageIndex) => (
//             <Message
//               key={message._id}
//               from={message.role === "user" ? "user" : "assistant"}
//             >
//               <MessageContent>
//                 {message.status === "processing" ? (
//                   <div className="flex items-center gap-2 text-muted-foreground">
//                     <LoaderIcon className="size-3.5 animate-spin" />
//                     <span>{message.content || "Thinking..."}</span>
//                   </div>
//                 ) : (
//                   <MessageResponse>{message.content}</MessageResponse>
//                 )}
//               </MessageContent>
//               {message.role === "assistant" &&
//                 message.status === "completed" &&
//                 messageIndex === (messages.length ?? 0) - 1 && (
//                   <MessageActions>
//                     <MessageAction
//                       onClick={() => {
//                         navigator.clipboard.writeText(message.content);
//                         toast.success("Copied to clipboard");
//                       }}
//                       label="Copy"
//                     >
//                       <CopyIcon className="size-3.3" />
//                     </MessageAction>
//                     {/* <MessageAction>
//                       <RegenerateIcon className="size-3.5" />
//                       Regenerate
//                     </MessageAction> */}
//                   </MessageActions>
//                 )}
//             </Message>
//           ))}

//            */}
//         </ConversationContent>
