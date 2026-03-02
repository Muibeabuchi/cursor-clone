import { ConvexError } from "convex/values";
import { GenericQueryCtx } from "convex/server";
import { DataModel, Id } from "../_generated/dataModel";
import { getUserOrThrow } from "./authModel";

export async function getProjectOrThrow({
  ctx,
  projectId,
}: {
  ctx: GenericQueryCtx<DataModel>;
  projectId: Id<"projects">;
}) {
  const project = await ctx.db.get("projects", projectId);

  if (!project) {
    throw new ConvexError("Project not found");
  }
  return project;
}

export async function ensureProjectBelongsTouser({
  ctx,
  projectId,
}: {
  ctx: GenericQueryCtx<DataModel>;
  projectId: Id<"projects">;
}) {
  const user = await getUserOrThrow(ctx);

  const project = await getProjectOrThrow({ ctx, projectId });

  if (project.ownerId !== user._id) {
    throw new ConvexError("Unauthorized access to this project");
  }
  return {
    project,
    user
  };
}
