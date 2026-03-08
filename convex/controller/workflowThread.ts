import { vWorkflowId } from "@convex-dev/workflow";
import { internalMutation, mutation } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { vResultValidator } from "@convex-dev/workpool";

export const create = mutation({
  args: {
    workflowId: vWorkflowId,
    threadId: v.string(),
    projectId: v.id("projects"),
    userId: v.string(),
    workflowStatus: v.union(v.literal("processing"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("workflowThread", args);
  },
});

export const updateWorkflowStatus = internalMutation({
  args: { workflowId: vWorkflowId, result: vResultValidator },
  async handler(ctx, args) {
    const workflowThreads = await ctx.db
      .query("workflowThread")
      .withIndex("by_workflow", (q) => q.eq("workflowId", args.workflowId))
      .collect();

    if (workflowThreads.length === 0) {
      throw new ConvexError(
        `No workflowTHread was found associated with workflow of id ${args.workflowId}`,
      );
    }

    for (const worflowThread of workflowThreads) {
      await ctx.db.patch("workflowThread", worflowThread._id, {
        workflowStatus: "cancelled",
      });
    }
  },
});
