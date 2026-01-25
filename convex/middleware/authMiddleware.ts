import {
  customQuery,
  customMutation,
} from "convex-helpers/server/customFunctions";
import { mutation, query } from "../_generated/server";
import { getUserOrThrow } from "../models/authModel";

export const authenticatedQuery = customQuery(query, {
  args: {},
  async input(ctx) {
    const user = await getUserOrThrow(ctx);
    return { ctx: { user }, args: {} };
  },
});

export const authenticatedMutation = customMutation(mutation, {
  args: {},
  async input(ctx) {
    const user = await getUserOrThrow(ctx);
    return { ctx: { user }, args: {} };
  },
});
