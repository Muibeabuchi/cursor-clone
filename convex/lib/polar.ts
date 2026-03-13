import { Polar } from "@convex-dev/polar";
import { api, components } from "../_generated/api";

export const polar = new Polar(components.polar, {
  products: {
    Monthly: "3202f869-13ff-4249-9306-5c9223d71966",
    Yearly: "3491ec8b-6c77-4876-9c62-f9348952d3b0",
    // premiumPlusMonthly: "8e8c2c8b-537b-4012-8a5a-9ec21a780d01",
    // premiumPlusYearly: "06a88a12-f2b3-4134-9469-c5eb50e6459b",
  },
  getUserInfo: async (ctx): Promise<{ userId: string; email: string }> => {
    const user = await ctx.runQuery(api.auth.getCurrentUser);

    if (!user) {
      throw new Error("User not found");
    }
    return {
      userId: user._id,
      email: user.email,
    };
  },

  // These can be configured in code or via environment variables
  // Uncomment and replace with actual values to configure in code:
  // organizationToken: "your_organization_token", // Or use POLAR_ORGANIZATION_TOKEN env var
  // webhookSecret: "your_webhook_secret", // Or use POLAR_WEBHOOK_SECRET env var
  // server: "sandbox", // "sandbox" or "production", falls back to POLAR_SERVER env var
});

// Export API functions from the Polar client
export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  getConfiguredProducts,
  listAllProducts,
  listAllSubscriptions,
  generateCheckoutLink,
  generateCustomerPortalUrl,
} = polar.api();
