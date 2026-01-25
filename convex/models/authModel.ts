import { ConvexError } from "convex/values";
import { authComponent } from "../auth";
import type { DataModel } from "../_generated/dataModel";
import { GenericQueryCtx } from "convex/server";

export async function getUserOrThrow(ctx: GenericQueryCtx<DataModel>) {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) {
    throw new ConvexError("Unauthorized access to this project");
  }
  return user;
}
