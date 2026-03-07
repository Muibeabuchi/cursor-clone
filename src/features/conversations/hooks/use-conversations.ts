import { convexQuery, useConvexMutation } from "@convex-dev/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "convex/_generated/api";
import { paginationOptsValidator } from "convex/server";

import { Doc, Id } from "convex/_generated/dataModel";

export const conversationQueryOptions = {
  getConversationByProjectThreadId: ({
    projectThreadId,
  }: {
    projectThreadId: Id<"projectThreads"> | null;
  }) =>
    convexQuery(
      api.controller.projectThread.getConversationByProjectThreadId,
      projectThreadId
        ? {
            projectThreadId,
          }
        : "skip",
    ),
  getConversations: ({
    projectId,
    paginationOpts,
  }: {
    projectId: Id<"projects">;
    paginationOpts: (typeof paginationOptsValidator)["type"];
  }) =>
    convexQuery(api.controller.projectThread.getConversationsByProjectId, {
      projectId,
      paginationOpts: {
        cursor: paginationOpts.cursor,
        numItems: paginationOpts.numItems,
      },
    }),
};

export const useConversation = ({
  projectThreadId,
}: {
  projectThreadId: Id<"projectThreads"> | null;
}) =>
  useQuery(
    conversationQueryOptions.getConversationByProjectThreadId({
      projectThreadId,
    }),
  );

export const useConversations = ({
  projectId,
  paginationOpts,
}: {
  projectId: Id<"projects">;
  paginationOpts: (typeof paginationOptsValidator)["type"];
}) =>
  useQuery(
    conversationQueryOptions.getConversations({ projectId, paginationOpts }),
  );

// // ==================================MUTATIONS==========================================//

export const useCreateConversation = () => {
  const createConversation = useMutation({
    mutationFn: useConvexMutation(
      api.controller.projectThread.createProjectThread,
    ),
    //     .withOptimisticUpdate((localStorage, variables) => {
    //       const { projectId, title } = variables;
    //       const data = localStorage.getQuery(
    //         api.controller.conversations.getByProjectId,
    //         {
    //           projectId,
    //         },
    //       );
    //       if (!data) return;

    //       const now = Date.now();
    //       const newData: Doc<"conversations"> = {
    //         _id: crypto.randomUUID() as Id<"conversations">,
    //         _creationTime: now,
    //         projectId,
    //         title,
    //         updatedAt: now,
    //       };

    //       localStorage.setQuery(
    //         api.controller.conversations.getByProjectId,
    //         {
    //           projectId,
    //         },
    //         [...data, newData],
    //       );
    //     }),
  });
  return createConversation;
};

// export const useCreateMessage = () => {
//   const createMessage = useMutation({
//     mutationFn: useConvexMutation(
//       api.controller.projectThread.createProjectThread,
//     )
//     // .withOptimisticUpdate((localStorage, variables) => {
//     //   const { projectId, title } = variables;
//     //   const data = localStorage.getQuery(
//     //     api.controller.conversations.getByProjectId,
//     //     {
//     //       projectId,
//     //     },
//     //   );
//     //   if (!data) return;

//     //   const now = Date.now();
//     //   const newData: Doc<"conversations"> = {
//     //     _id: crypto.randomUUID() as Id<"conversations">,
//     //     _creationTime: now,
//     //     projectId,
//     //     title,
//     //     updatedAt: now,
//     //   };

//     //   localStorage.setQuery(
//     //     api.controller.conversations.getByProjectId,
//     //     {
//     //       projectId,
//     //     },
//     //     [...data, newData],
//     //   );
//     // }),
//   });
//   return createMessage;
// };
