import { v } from "convex/values";
import { workflow } from "../components/workflow";
import { internal } from "../_generated/api";
// import { GenericActionCtx, GenericMutationCtx } from "convex/server";
// import { DataModel } from "../_generated/dataModel";

// Thi workflow will be called by the mutation for creating messages in a conversation(thread)
export const processMessageWorkflow = workflow.define({
  args: {
    threadId: v.string(),
    promptMessageId: v.string(),
    projectId: v.id("projects"),
    projectThreadId: v.id("projectThreads"),
    userId: v.string(),
  },
  handler: async (step, args) => {
    await step.runAction(
      internal.controller.messages.processMessage,
      {
        threadId: args.threadId,
        projectId: args.projectId,
        projectThreadId: args.projectThreadId,
        promptMessageId: args.promptMessageId,
        workflowId: step.workflowId,
        userId: args.userId,
      },
      {
        retry: {
          maxAttempts: 2,
          initialBackoffMs: 1000,
          base: 1,
        },
        name: "processMessageAgent",
      },
    );
  },
});
