import {
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getUserOrThrow } from "../models/authModel";
import { getProjectOrThrow } from "../models/projectModel";

export const authorizedProjectMutation = customMutation(mutation, {
  args: {
    projectId: v.id("projects"),
  },
  async input(ctx, args) {
    const user = await getUserOrThrow(ctx);

    const project = await getProjectOrThrow(ctx, args.projectId);

    if (project.ownerId !== user._id) {
      throw new ConvexError("Unauthorized access to this project");
    }
    return { ctx: { project }, args: { projectId: args.projectId } };
  },
});

export const authorizedProjectQuery = customQuery(query, {
  args: {
    projectId: v.id("projects"),
  },
  async input(ctx, args) {
    const user = await getUserOrThrow(ctx);

    const project = await getProjectOrThrow(ctx, args.projectId);

    if (project.ownerId !== user._id) {
      throw new ConvexError("Unauthorized access to this project");
    }
    return { ctx: { project }, args: { projectId: args.projectId } };
  },
});
