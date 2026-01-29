import {
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ensureFileBelongsToProject } from "../models/fileModel";

export const authorizedFileQuery = customQuery(query, {
  args: {
    fileId: v.id("files"),
  },
  async input(ctx, args) {
    const { file, project } = await ensureFileBelongsToProject({
      ctx,
      fileId: args.fileId,
    });
    return { ctx: { file, project }, args: { fileId: args.fileId } };
  },
});

export const authorizedFileMutation = customMutation(mutation, {
  args: {
    fileId: v.id("files"),
  },
  async input(ctx, args) {
    const { file, project } = await ensureFileBelongsToProject({
      ctx,
      fileId: args.fileId,
    });
    return { ctx: { file, project }, args: { fileId: args.fileId } };
  },
});
