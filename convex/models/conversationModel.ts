import { DataModel, Id } from "../_generated/dataModel";
import { ensureProjectBelongsTouser } from "./projectModel";
import { components } from "../_generated/api";
import { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import { ConvexError } from "convex/values";

export async function authorizeThreadAccess({
  ctx,
  projectThreadId,
}: {
  ctx: GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>;
  projectThreadId: Id<"projectThreads">;
}) {
  // This function checks that the user is the owner of the projectThread

  const projectThread = await ctx.db.get("projectThreads", projectThreadId);
  if (!projectThread) {
    throw new ConvexError("ProjectThread does not exist");
  }
  // confirm that the project belongs to the user
  const {
    project,
    user: { _id: userId, ...user },
  } = await ensureProjectBelongsTouser({
    ctx,
    projectId: projectThread.projectId,
  });

  if (userId !== projectThread.userId) {
    throw new ConvexError(
      "UNAUTHORIZED: User does not have access to this projectThread",
    );
  }

  const thread = await ctx.runQuery(components.agent.threads.getThread, {
    threadId: projectThread.threadId,
  });
  if (!thread) {
    throw new ConvexError("THread does not exist");
  }

  if (userId !== thread.userId) {
    throw new ConvexError(
      "UNAUTHORIZED: user does not have access to this thread",
    );
  }

  return {
    thread,
    projectThread,
    project,
    user,
    userId,
  };
}

// ========================= AGENT TOOL MODELS======================//
