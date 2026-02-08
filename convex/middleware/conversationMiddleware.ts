import {
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import {
  ensureConversationBelongsToProject,
  getConversationOrThrow,
} from "../models/conversationModel";
import { getUserOrThrow } from "../models/authModel";

export const authorizedConversationQuery = customQuery(query, {
  args: {
    conversationId: v.id("conversations"),
  },
  async input(ctx, args) {
    const user = await getUserOrThrow(ctx);
    const { conversation, project } = await ensureConversationBelongsToProject({
      conversationId: args.conversationId,
      ctx,
    });
    // check if the project is owned by the user
    if (project.ownerId !== user._id) {
      throw new ConvexError("Project does not belong to this user");
    }
    return {
      ctx: { conversation, project },
      args: { conversationId: args.conversationId },
    };
  },
});

export const authorizedConversationMutation = customMutation(mutation, {
  args: {
    conversationId: v.id("conversations"),
  },
  async input(ctx, args) {
    const { conversation, project } = await ensureConversationBelongsToProject({
      conversationId: args.conversationId,
      ctx,
    });

    const user = await getUserOrThrow(ctx);
    // check if the project is owned by the user
    if (project.ownerId !== user._id) {
      throw new ConvexError("Project does not belong to this user");
    }
    return {
      ctx: { conversation, project },
      args: { conversationId: args.conversationId },
    };
  },
});
