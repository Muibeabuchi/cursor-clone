import { betterAuth } from "better-auth/minimal";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import authConfig from "./auth.config";
import { components } from "./_generated/api";
import { query } from "./_generated/server";
import type { GenericCtx } from "@convex-dev/better-auth";
import type { DataModel, Id } from "./_generated/dataModel";
import { polar } from "./lib/polar";

const siteUrl = process.env.SITE_URL!;

// The component client has methods needed for integrating Convex with Better Auth,
// as well as helper methods for general use.
export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    database: authComponent.adapter(ctx),
    // Configure simple, non-verified email/password to get started
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      // The Convex plugin is required for Convex compatibility
      convex({ authConfig }),
    ],
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_OAUTH_CLIENT_ID!,
        clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET!,
        scope: ["read:user", "repo", "user:email"],
      },
    },
  });
};

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) =>
    // : Promise<{
    //   _id: string;
    //   _creationTime: number;
    //   image?: string | null | undefined | undefined;
    //   userId?: string | null | undefined | undefined;
    //   twoFactorEnabled?: boolean | null | undefined | undefined;
    //   isAnonymous?: boolean | null | undefined | undefined;
    //   username?: string | null | undefined | undefined;
    //   displayUsername?: string | null | undefined | undefined;
    //   phoneNumber?: string | null | undefined | undefined;
    //   phoneNumberVerified?: boolean | null | undefined | undefined;
    //   createdAt: number;
    //   updatedAt: number;
    //   email: string;
    //   emailVerified: boolean;
    //   name: string;
    // } | null>
    {
      try {
        const user = await authComponent.getAuthUser(ctx);
        const subscription = await polar.getCurrentSubscription(ctx, {
          userId: user._id,
        });
        return {
          ...user,
          subscription,
          isFree: !subscription,
          isPremium:
            subscription?.productKey === "Monthly" ||
            subscription?.productKey === "Yearly",
        };
      } catch (error) {
        return null;
      }
    },
});
