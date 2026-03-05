import { v } from "convex/values";
import { workflow } from "../components/workflow";
import { internal } from "../_generated/api";

// Thi workflow will be called by the mutation for creating messages in a conversation(thread)
export const processMessageWorkflow = workflow.define({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
  },
  handler: async (step, args) => {
    await step.runAction(
      internal.controller.messages.processMessage,
      {
        threadId: args.threadId,
        promptMessageId: args.promptMessageId,
      },
      { retry: true, name: "processMessageAgent" },
    );
  },
});
