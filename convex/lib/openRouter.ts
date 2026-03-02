import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const gptOss120bOpenRouterProvider = openrouter.chat(
  "openai/gpt-oss-120b:free",
);
const glmAirModel = openrouter.chat("z-ai/glm-4.5-air:free");

const qwen3Coder = openrouter.chat("qwen/qwen3-coder:free");

export { gptOss120bOpenRouterProvider, glmAirModel, qwen3Coder };
