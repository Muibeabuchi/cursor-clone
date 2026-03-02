import { defineApp } from "convex/server";
import betterAuth from "@convex-dev/better-auth/convex.config";
import workflow from "@convex-dev/workflow/convex.config.js";
import agent from "@convex-dev/agent/convex.config.js";

const app = defineApp();
app.use(betterAuth);
app.use(workflow);
app.use(agent);

export default app;
