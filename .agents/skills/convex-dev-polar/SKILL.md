---
name: convex-dev-polar
description: Add Polar subscriptions and billing to Convex apps with built-in webhook handling and subscription state management. Use when working with payments features, Polar.
---

# Polar

## Instructions

Polar is a Convex component that provides add polar subscriptions and billing to convex apps with built-in webhook handling and subscription state management.

### Installation

```bash
npm install @convex-dev/polar
```

### Capabilities

- Integrate Polar billing with automatic webhook processing in Convex functions
- Manage subscription states and customer data directly in your Convex database
- Handle payment events and billing cycles without custom webhook infrastructure
- Access subscription status and billing data in your Convex queries and mutations

## Examples

### how to add subscription billing to Convex app

The @convex-dev/polar component integrates Polar's subscription billing directly into your Convex backend. It handles webhook processing automatically and stores subscription data in your Convex database, letting you check subscription status in queries and respond to billing events in mutations.

### Convex Polar webhook integration

This component provides built-in webhook handlers for Polar billing events in your Convex functions. Webhooks are processed automatically and trigger updates to subscription state, eliminating the need for separate webhook endpoints or manual event processing.

### manage subscription data in Convex database

The Polar component stores customer and subscription information directly in your Convex tables. You can query subscription status, billing history, and customer data using standard Convex queries, making it easy to build subscription-aware features in your app.

## Troubleshooting

**How does the Polar component handle webhook verification in Convex?**

The @convex-dev/polar component includes built-in webhook signature verification using Polar's signing keys. It automatically validates incoming webhooks and processes verified events through your Convex functions, ensuring secure handling of billing data.

**What subscription data does this component store in Convex?**

The Polar component stores customer profiles, subscription status, billing cycles, and payment events in your Convex database. This data is accessible through standard Convex queries, allowing you to build subscription-gated features and billing dashboards directly in your app.

**Can I customize how billing events are processed?**

Yes, the @convex-dev/polar component allows you to define custom handlers for different Polar webhook events. You can add business logic to respond to subscription changes, failed payments, or cancellations using standard Convex mutations and actions.

**Does this component work with Polar's subscription plans?**

The @convex-dev/polar component supports all Polar subscription features including multiple plans, usage-based billing, and plan changes. It automatically syncs subscription plan data and billing cycles with your Convex database for real-time subscription management.

## Resources

- [npm package](https://www.npmjs.com/package/%40convex-dev%2Fpolar)
- [GitHub repository](https://github.com/erquhart/convex-polar)
- [Convex Components Directory](https://www.convex.dev/components/polar)
- [Convex documentation](https://docs.convex.dev)
