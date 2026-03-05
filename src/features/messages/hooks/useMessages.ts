// import { useMutation } from "convex/react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../../convex/_generated/api";
import { optimisticallySendMessage } from "@convex-dev/agent/react";
import { useConvexMutation } from "@convex-dev/react-query";

//? revert back to the original convex hook if this fails
export const useSendMessage = () => {
  return useMutation({
    mutationFn: useConvexMutation(
      api.controller.messages.createMessage,
    ).withOptimisticUpdate(
      optimisticallySendMessage(
        api.controller.messages.getMessagesByProjectThreadId,
      ),
    ),
  });
};
