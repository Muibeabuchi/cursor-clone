import {
  customQuery,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
// import { ConvexError } from "convex/values";

export const authenticatedQuery = customQuery(query, {
  args: {},
  async input(ctx, args, extra) {
    // might need to wrap this call in a try-catch block
    const user = await authComponent.getAuthUser(ctx);

    return { ctx: { user }, args: {} };
  },
});

export const authenticatedMutation = customMutation(mutation, {
  args: {},
  async input(ctx, args, extra) {
    // might need to wrap this call in a try-catch block
    const user = await authComponent.getAuthUser(ctx);
    return { ctx: { user }, args: {} };
  },
});
