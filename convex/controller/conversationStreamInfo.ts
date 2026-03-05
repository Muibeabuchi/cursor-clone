import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const insertConversationStreamInfo = internalMutation({
  args: {
    threadId: v.string(),
    workflowId: v.string(),
    projectId: v.id("projects"),
    projectThreadId: v.id("projectThreads"),
    streamIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // use promise.all to insert the data
    const promises = args.streamIds.map((streamId) => {
      return ctx.db.insert("conversationStreamInfo", {
        threadId: args.threadId,
        workflowId: args.workflowId,
        projectId: args.projectId,
        projectThreadId: args.projectThreadId,
        streamId: streamId,
      });
    });
    await Promise.all(promises);
  },
});
