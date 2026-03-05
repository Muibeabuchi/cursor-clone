import { components } from "../_generated/api";
import { Agent, stepCountIs } from "@convex-dev/agent";
import { gemini2_5Embedding, gemini2_5FlashLite } from "../lib/geminiModel";
import {
  TITLE_GENERATOR_SYSTEM_PROMPT,
  CODING_AGENT_SYSTEM_PROMPT,
} from "../utils/constants";
import {
  // qwenTextEmbeddingModel,
  glmAirModel,
  mistralEmbedModel,
} from "../lib/openRouter";

export const projectConversationAgent = new Agent(components.agent, {
  name: "project-conversation-agent",
  languageModel: gemini2_5FlashLite,
  embeddingModel: mistralEmbedModel,
  instructions: CODING_AGENT_SYSTEM_PROMPT,
  stopWhen: stepCountIs(10),
  tools: {},
});

export const titleAgent = new Agent(components.agent, {
  name: "title-generator",
  instructions: TITLE_GENERATOR_SYSTEM_PROMPT,
  languageModel: gemini2_5FlashLite,
  embeddingModel: mistralEmbedModel,
  // might not need tool or a stepCount
});
