import { v } from "convex/values";
import {
  authorizedProjectMutation,
  authorizedProjectQuery,
} from "../middleware/projectMiddleware";
import { authorizedConversationQuery } from "../middleware/conversationMiddleware";

export const getById = authorizedConversationQuery({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return ctx.conversation;
  },
});

export const getByProjectId = authorizedProjectQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    return conversations;
  },
});

export const getMessages = authorizedConversationQuery({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("asc")
      .collect();
    return messages;
  },
});

//  =============================MUTATIONS=============================
export const create = authorizedProjectMutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.insert("conversations", {
      projectId: args.projectId,
      title: args.title,
      updatedAt: Date.now(),
    });
    return conversation;
  },
});
