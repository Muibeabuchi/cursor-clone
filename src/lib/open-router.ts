import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const grokOpenRouterProvider = openrouter.chat("x-ai/grok-code-fast-1");

export default openrouter;
