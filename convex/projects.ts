import {
  authenticatedMutation,
  authenticatedQuery,
} from "./middleware/authenticatedUserMiddleware";
import { v } from "convex/values";

export const getPartial = authenticatedQuery({
  args: {
    limit: v.number(),
  },
  async handler(ctx, args) {
    const { _id: userId } = ctx.user;

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", userId))
      .order("desc")
      .take(args.limit);

    return projects;
  },
});

export const get = authenticatedQuery({
  args: {},
  async handler(ctx) {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ctx.user._id))
      .order("desc")
      .collect();
    return projects;
  },
});

// ---------------------------------MUTATIONS---------------------------------//

export const create = authenticatedMutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, args) {
    const { _id: userId } = ctx.user;

    const project = await ctx.db.insert("projects", {
      name: args.name,
      ownerId: userId,
      updatedAt: Date.now(),
    });

    return project;
  },
});
