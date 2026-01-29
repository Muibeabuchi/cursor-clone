import { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import { DataModel, Id } from "../_generated/dataModel";
import { ConvexError } from "convex/values";
import { getUserOrThrow } from "./authModel";

export async function ensureFileBelongsToProject({
  ctx,
  fileId,
}: {
  ctx: GenericQueryCtx<DataModel>;
  fileId: Id<"files">;
}) {
  const user = await getUserOrThrow(ctx);
  const file = await ctx.db.get("files", fileId);

  if (!file) {
    throw new ConvexError("File not found");
  }

  const project = await ctx.db.get("projects", file.projectId);

  if (!project) {
    throw new ConvexError("Project not found");
  }

  if (project.ownerId !== user._id) {
    throw new ConvexError("Unauthorized access to this project");
  }

  return { file, project };
}

export async function deleteRecursive({
  ctx,
  fileId,
}: {
  ctx: GenericMutationCtx<DataModel>;
  fileId: Id<"files">;
}) {
  const item = await ctx.db.get("files", fileId);

  if (!item) {
    return null;
  }

  // if its a folder, we delete all the children first
  if (item.fileType === "folder") {
    const children = await ctx.db
      .query("files")
      .withIndex("by_project_parent", (q) =>
        q.eq("projectId", item.projectId).eq("parentId", item._id),
      )
      .collect();
    for (const child of children) {
      await deleteRecursive({ ctx, fileId: child._id });
    }
  }

  // delete storage file if it exists
  if (item.storageId) {
    await ctx.storage.delete(item.storageId);
  }

  // delete the file/folder
  await ctx.db.delete("files", fileId);
}
