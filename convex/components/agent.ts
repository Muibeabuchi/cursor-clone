import { components } from "../_generated/api";
import { Agent, stepCountIs } from "@convex-dev/agent";
import { gemini2_5FlashLite } from "../lib/geminiModel";

export const projectConversationAgent = new Agent(components.agent, {
  name: "project-conversation-agent",
  languageModel: gemini2_5FlashLite,
  instructions: "You are a helpful assistant.",
  stopWhen: stepCountIs(10),
  //   tools: [],
});
