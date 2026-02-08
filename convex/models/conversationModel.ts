import { GenericQueryCtx } from "convex/server";
import { ConvexError } from "convex/values";
import { DataModel, Id } from "../_generated/dataModel";
import { getProjectOrThrow } from "./projectModel";

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

export const ensureConversationBelongsToProject = async ({
  conversationId,

  ctx,
}: {
  conversationId: Id<"conversations">;
  ctx: GenericQueryCtx<DataModel>;
}) => {
  const conversation = await getConversationOrThrow({ conversationId, ctx });
  // get the project using the projectId in the conversation
  const project = await getProjectOrThrow(ctx, conversation.projectId);

  if (!project) {
    throw new ConvexError("Project not found");
  }
  return { conversation, project };
};
