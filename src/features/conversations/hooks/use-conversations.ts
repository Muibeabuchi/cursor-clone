import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { Doc, Id } from "convex/_generated/dataModel";

const conversationQueryOptions = {
  getConversation: ({
    conversationId,
  }: {
    conversationId: Id<"conversations">;
  }) =>
    convexQuery(api.controller.conversations.getById, {
      conversationId,
    }),
  getConversations: ({ projectId }: { projectId: Id<"projects"> }) =>
    convexQuery(api.controller.conversations.getByProjectId, { projectId }),
};

export const useConversation = ({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) => useQuery(conversationQueryOptions.getConversation({ conversationId }));

export const useConversations = ({
  projectId,
}: {
  projectId: Id<"projects">;
}) => useQuery(conversationQueryOptions.getConversations({ projectId }));

export const useCreateConversation = () => {
  const createConversation = useMutation({
    mutationFn: useConvexMutation(
      api.controller.conversations.create,
    ).withOptimisticUpdate((localStorage, variables) => {
      const { projectId, title } = variables;
      const data = localStorage.getQuery(
        api.controller.conversations.getByProjectId,
        {
          projectId,
        },
      );
      if (!data) return;

      const now = Date.now();
      const newData: Doc<"conversations"> = {
        _id: crypto.randomUUID() as Id<"conversations">,
        _creationTime: now,
        projectId,
        title,
        updatedAt: now,
      };

      localStorage.setQuery(
        api.controller.conversations.getByProjectId,
        {
          projectId,
        },
        [...data, newData],
      );
    }),
  });
  return createConversation;
};
