import { Id } from "convex/_generated/dataModel";
import { useConversations } from "../hooks/use-conversations";

export const ConversationSidebar = ({
  projectId,
}: {
  projectId: Id<"projects">;
}) => {
  const { data: conversations } = useConversations({ projectId });

  return (
    <div>
      <h1>Conversation Sidebar</h1>
    </div>
  );
};
