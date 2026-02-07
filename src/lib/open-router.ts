import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const grokOpenRouterProvider = openrouter.chat("x-ai/grok-code-fast-1");

export const deepSeekV3OpenRouterProvider = openrouter.chat(
  "deepseek/deepseek-chat",
);
export const qwen3CoderOpenRouterProvider = openrouter.chat("qwen/qwen3-coder");
export const ponyAlphaOpenRouterProvider = openrouter.chat(
  "openrouter/pony-alpha",
);
export const gptOss120bOpenRouterProvider = openrouter.chat(
  "openai/gpt-oss-120b:free",
);
export const mistralSmall3124bOpenRouterProvider = openrouter.chat(
  "mistralai/mistral-small-3.1-24b-instruct:free",
);
export const kimiK2ThinkingOpenRouterProvider = openrouter.chat(
  "moonshotai/kimi-k2-thinking",
);

export default openrouter;
