import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  // custom settings
  apiKey: process.env.GEMINI_API_KEY!,
});

export const GEMINI_MODEL = google.chat("gemini-2.5-pro");
