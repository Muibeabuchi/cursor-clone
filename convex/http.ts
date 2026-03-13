import { Hono } from "hono";
import { HonoWithConvex, HttpRouterWithHono } from "convex-helpers/server/hono";
import { ActionCtx } from "./_generated/server";
import { createAuth } from "./auth";
import { polar } from "./lib/polar";

const app: HonoWithConvex<ActionCtx> = new Hono();

// Redirect root well-known to api well-known
app.get("/.well-known/openid-configuration", async (c) => {
  return c.redirect("/api/auth/convex/.well-known/openid-configuration");
});

app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

// Register the webhook handler at /polar/events

/**
 * Verifies the GitHub webhook signature using HMAC-SHA256.
 *
 * GitHub signs every webhook payload with the secret you configured on your
 * App/webhook and puts the result in the `x-hub-signature-256` header as:
 *   sha256=<hex-digest>
 *
 * We recompute the HMAC over the raw request body and compare using a
 * timing-safe verify to prevent timing attacks.
 */
async function verifyGithubSignature(
  rawBody: string,
  signatureHeader: string,
): Promise<boolean> {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    console.error("GITHUB_WEBHOOK_SECRET env variable is not set");
    return false;
  }

  // The header value is "sha256=<hex-digest>"
  const [prefix, receivedHex] = signatureHeader.split("=");
  if (prefix !== "sha256" || !receivedHex) {
    return false;
  }

  // Import the secret as an HMAC-SHA256 key using the Web Crypto API
  // (available natively in Convex's Cloudflare Workers runtime)
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );

  // Convert the received hex digest to a Uint8Array for timing-safe comparison
  const receivedBytes = new Uint8Array(
    receivedHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)),
  );

  // Use crypto.subtle.verify for a constant-time comparison
  return crypto.subtle.verify(
    "HMAC",
    key,
    receivedBytes,
    encoder.encode(rawBody),
  );
}

/**
 * GitHub App Webhook endpoint.
 *
 * Validates the HMAC-SHA256 signature on every incoming request before
 * processing the payload. Set GITHUB_WEBHOOK_SECRET in your Convex
 * environment variables to match the secret configured on your GitHub App.
 *
 * Handled events:
 *  - `installation`             action `created` — user installed the app on repo(s)
 *  - `installation`             action `deleted` — user uninstalled the app
 *  - `installation_repositories` action `added`   — user added repos to an existing install
 */
app.post("/github/webhook", async (c) => {
  const githubEvent = c.req.header("x-github-event");
  const signatureHeader = c.req.header("x-hub-signature-256");

  if (!githubEvent) {
    return c.json({ error: "Missing x-github-event header" }, 400);
  }
  if (!signatureHeader) {
    return c.json({ error: "Missing x-hub-signature-256 header" }, 400);
  }

  // Read the raw body text BEFORE parsing as JSON.
  // The HMAC must be computed over the exact bytes GitHub sent.
  const rawBody = await c.req.text();

  // Verify the signature — reject anything that doesn't match our secret
  const isValid = await verifyGithubSignature(rawBody, signatureHeader);
  if (!isValid) {
    return c.json({ error: "Invalid signature" }, 401);
  }

  // Signature is valid — now safely parse the payload
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  // Handle `installation` — fired when a user installs or uninstalls the app
  if (githubEvent === "installation") {
    const action = payload.action as string | undefined;

    if (action === "created") {
      // User successfully added our GitHub App to one or more repositories.
      // payload.installation — installation details (id, account, permissions, etc.)
      // payload.repositories — array of repos granted access
      const installation = payload.installation as Record<string, unknown>;
      const repositories = (payload.repositories ?? []) as Array<
        Record<string, unknown>
      >;

      console.log(
        `GitHub App installed by "${(installation?.account as Record<string, unknown>)?.login}" ` +
          `on ${repositories.length} repository(ies).`,
      );

      // TODO: persist installation + repositories to the database
      return c.json({ received: true, event: "installation.created" }, 200);
    }

    if (action === "deleted") {
      const installation = payload.installation as Record<string, unknown>;
      console.log(
        `GitHub App uninstalled. Installation id: ${installation?.id}`,
      );
      // TODO: clean up stored installation data
      return c.json({ received: true, event: "installation.deleted" }, 200);
    }
  }

  // Handle `installation_repositories` — fires when repos are added/removed
  // from an existing installation (without a full reinstall)
  if (githubEvent === "installation_repositories") {
    const action = payload.action as string | undefined;

    if (action === "added") {
      const addedRepos = (payload.repositories_added ?? []) as Array<
        Record<string, unknown>
      >;
      console.log(
        `${addedRepos.length} repository(ies) added to existing GitHub App installation.`,
      );
      // TODO: persist the new repositories to the database
      return c.json(
        { received: true, event: "installation_repositories.added" },
        200,
      );
    }
  }

  // Acknowledge all other events we're not explicitly handling
  return c.json({ received: true, event: githubEvent }, 200);
});

const http = new HttpRouterWithHono(app);
polar.registerRoutes(http as any);

export default http;
