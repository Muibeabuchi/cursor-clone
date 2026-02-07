import {
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { getConversationOrThrow } from "../models/conversationModel";

export const authorizedConversationQuery = customQuery(query, {
  args: {
    conversationId: v.id("conversations"),
  },
  async input(ctx, args) {
    const conversation = await getConversationOrThrow({
      ctx,
      conversationId: args.conversationId,
    });
    return {
      ctx: { conversation },
      args: { conversationId: args.conversationId },
    };
  },
});

export const authorizedConversationMutation = customMutation(mutation, {
  args: {
    conversationId: v.id("conversations"),
  },
  async input(ctx, args) {
    const conversation = await getConversationOrThrow({
      ctx,
      conversationId: args.conversationId,
    });
    return {
      ctx: { conversation },
      args: { conversationId: args.conversationId },
    };
  },
});
