import { formatDistanceToNow } from "date-fns";
import {
  CommandDialog,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
  CommandEmpty,
} from "~/components/ui/command";
import { useConversations } from "../hooks/use-conversations";
import { Id } from "convex/_generated/dataModel";

interface PastConversationsDialogProps {
  projectId: Id<"projects">;
  onSelect?: (conversationId: Id<"projectThreads">) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PastConversationsDialog = ({
  projectId,
  onSelect,
  open,
  onOpenChange,
}: PastConversationsDialogProps) => {
  const { data: conversations } = useConversations({
    projectId,
    paginationOpts: {
      numItems: 20,
      cursor: null,
    },
  });

  //   if (!conversations) {
  //     return null;
  //   }

  const handleSelectConversation = (conversationId: Id<"projectThreads">) => {
    onSelect?.(conversationId);
    onOpenChange(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Past Conversations"
      description="Select a conversation to continue"
    >
      <CommandInput placeholder="Search conversations..." />
      <CommandList>
        <CommandEmpty>No conversations found.</CommandEmpty>
        <CommandGroup>
          {conversations?.page?.map((conversation) => (
            <CommandItem
              key={conversation._id}
              onSelect={() => {
                handleSelectConversation(conversation.filteredProjecthread._id);
              }}
              value={`${conversation.title}-${conversation._id}`}
            >
              <div className="flex gap-0.5 flex-col">
                <span>{conversation.title}</span>
                <span>
                  {formatDistanceToNow(conversation._creationTime, {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
