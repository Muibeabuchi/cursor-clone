import { ConvexError } from "convex/values";
import { GenericQueryCtx } from "convex/server";
import { DataModel, Id } from "../_generated/dataModel";

export async function getProjectOrThrow(
  ctx: GenericQueryCtx<DataModel>,
  projectId: Id<"projects">,
) {
  const project = await ctx.db.get("projects", projectId);

  if (!project) {
    throw new ConvexError("Project not found");
  }
  return project;
}
