import { GenericQueryCtx } from "convex/server";
import { ConvexError } from "convex/values";
import { DataModel, Id } from "../_generated/dataModel";

export const getConversationOrThrow = async ({
  conversationId,
  ctx,
}: {
  ctx: GenericQueryCtx<DataModel>;
  conversationId: Id<"conversations">;
}) => {
  const conversation = await ctx.db.get("conversations", conversationId);
  if (!conversation) {
    throw new ConvexError("Conversation not found");
  }
  return conversation;
};
