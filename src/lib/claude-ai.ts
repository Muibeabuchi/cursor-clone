import { createAnthropic } from "@ai-sdk/anthropic";

const anthropic = createAnthropic({
  // custom settings
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const HAIKU_MODEL = anthropic.chat("claude-3-haiku-20240307");
