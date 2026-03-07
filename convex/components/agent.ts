import { components } from "../_generated/api";
import { Agent, stepCountIs } from "@convex-dev/agent";
import {
  gemini2_5Embedding,
  gemini2_5FlashLite,
  gemini2_5Pro,
} from "../lib/geminiModel";
import {
  TITLE_GENERATOR_SYSTEM_PROMPT,
  CODING_AGENT_SYSTEM_PROMPT,
} from "../utils/constants";
import {
  // qwenTextEmbeddingModel,
  glmAirModel,
  mistralEmbedModel,
} from "../lib/openRouter";
import {
  deleteFilesTool,
  // listFilesTool,
  readFilesTool,
  renameFileTool,
  scrapeUrls,
  updateFileTool,
} from "../aiAgents/tools";

export const projectConversationAgent = new Agent(components.agent, {
  name: "project-conversation-agent",
  languageModel: glmAirModel,
  embeddingModel: mistralEmbedModel,
  instructions: CODING_AGENT_SYSTEM_PROMPT,
  stopWhen: stepCountIs(10),
  storageOptions: {
    saveMessages: "all",
  },
  tools: {
    readFilesTool,
    updateFileTool,
    renameFileTool,
    deleteFilesTool,
    scrapeUrls,
  },
});

export const titleAgent = new Agent(components.agent, {
  name: "title-generator",
  instructions: TITLE_GENERATOR_SYSTEM_PROMPT,
  languageModel: glmAirModel,
  embeddingModel: mistralEmbedModel,
  // might not need tool or a stepCount
});
